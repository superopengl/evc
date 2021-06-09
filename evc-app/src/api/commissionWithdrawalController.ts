
import { getRepository, getManager } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { v4 as uuidv4 } from 'uuid';
import { CommissionWithdrawal } from '../entity/CommissionWithdrawal';
import * as moment from 'moment';
import { User } from '../entity/User';
import { UserProfile } from '../entity/UserProfile';
import { getUtcNow } from '../utils/getUtcNow';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';
import { enqueueEmail, enqueueEmailToUserId } from '../services/emailService';
import { EmailTemplateType } from '../types/EmailTemplateType';

export const searchCommissionWithdrawal = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id, userId, after, before, status, page, size } = req.body;

  const pageNo = +page || 1;
  const pageSize = +size || 60;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getRepository(CommissionWithdrawal)
    .createQueryBuilder('x')
    .innerJoin(User, 'u', 'u.id = x."userId"')
    .innerJoin(UserProfile, 'p', 'u."profileId" = p.id')
    .where(`1=1`)

  if (id) {
    query = query.where(`x.id = :id`, { id });
  }
  if (userId) {
    query = query.andWhere(`x."userId" = :userId`, { userId });
  }
  if (after) {
    query = query.andWhere(`x."createdAt" >= :after`, { after: moment(after).startOf('day') })
  }
  if (before) {
    query = query.andWhere(`x."createdAt" <= :before`, { before: moment(before).endOf('day') })
  }
  if (status) {
    query = query.andWhere(`x.status = :status`, { status })
  }

  const count = await query.getCount();
  const data = await query
    .orderBy('x."createdAt"', 'DESC')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize)
    .select([
      'x.*',
      'email',
    ])
    .execute();

  res.json({
    count,
    page: pageNo,
    data
  });
});

export const listMyCommissionWithdrawal = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id }, } = req as any;

  const list = await getRepository(CommissionWithdrawal).find({
    where: {
      userId: id
    },
    order: {
      createdAt: 'DESC'
    }
  });

  res.json(list);
});

export const createCommissionWithdrawal = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id: userId, profile: { email } } } = req as any;
  const entity = new CommissionWithdrawal();
  const id = uuidv4();
  Object.assign(
    entity,
    req.body,
    {
      id,
      userId,
    }
  );

  const { amount } = entity;

  assert(amount > 0, 400, 'Amount must be a positive number');

  let hasEnoughCredit = false;
  await getManager().transaction(async m => {
    hasEnoughCredit = await getRepository(UserCreditTransaction)
      .createQueryBuilder()
      .where({ userId })
      .groupBy(`"userId"`)
      .having(`SUM(amount) >= :amount`, { amount })
      .select(`"userId"`)
      .getRawOne();
    if (hasEnoughCredit) {
      await m.insert(CommissionWithdrawal, entity);
    }
  });

  enqueueEmailToUserId(
    userId,
    EmailTemplateType.CommissionWithdrawalSubmitted,
    { referenceId: id }
  );

  assert(hasEnoughCredit, 400, 'No enough credit');

  res.json(entity.id);
});

export const getCommissionWithdrawal = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member', 'free');
  const { user: { id: userId }, role } = req as any;
  const { id } = req.params;

  const query = ['admin', 'agent'].includes(role) ? { id } : { id, userId };
  const entity = await getRepository(CommissionWithdrawal).findOne(query);
  assert(entity, 404);

  res.json(entity);
});

async function completeAndAdjustCredit(withdrawal: CommissionWithdrawal, comment) {
  const { amount, userId } = withdrawal;

  assert(amount > 0, 400, `Amount must be a positive number`);

  let hasEnoughCredit = false;
  await getManager().transaction(async m => {
    hasEnoughCredit = await getRepository(UserCreditTransaction)
      .createQueryBuilder()
      .where({ userId })
      .groupBy(`"userId"`)
      .having(`SUM(amount) >= :amount`, { amount })
      .select(`"userId"`)
      .getRawOne();

    if (hasEnoughCredit) {
      const credit = new UserCreditTransaction();
      credit.id = uuidv4();
      credit.userId = userId;
      credit.amount = -amount;
      credit.type = 'withdrawal';

      withdrawal.status = 'done';
      withdrawal.comment = comment;
      withdrawal.handledAt = getUtcNow();

      await m.save([credit, withdrawal]);
    }
  });

  assert(hasEnoughCredit, 400, 'No enough credit');
}

export const changeCommissionWithdrawalStatus = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { status, comment } = req.body;

  const withdrawal = await getRepository(CommissionWithdrawal).findOne(id);
  assert(withdrawal, 404);

  switch (withdrawal.status) {
    case 'submitted':
      if (status === 'rejected') {
        withdrawal.status = status;
        withdrawal.comment = comment;
        withdrawal.handledAt = getUtcNow();
        await getManager().save(withdrawal);

        enqueueEmailToUserId(
          withdrawal.userId,
          EmailTemplateType.CommissionWithdrawalRejected,
          { 
            referenceId: withdrawal.id, 
            comment: withdrawal.comment 
          }
        );
      } else if (status === 'done') {
        await completeAndAdjustCredit(withdrawal, comment);

        enqueueEmailToUserId(
          withdrawal.userId,
          EmailTemplateType.CommissionWithdrawalCompleted,
          { 
            referenceId: withdrawal.id, 
            comment: withdrawal.comment 
          }
        );
      } else {
        assert(false, 400, `Unknown target status ${status}`);
      }
      break;
    case 'rejected':
    case 'done':
      assert(false, 400, `This commission withdrawal application was finished already`);
      break;
    default:
      assert(false, 500, `Unknown status ${withdrawal.status}`);
  }

  res.json();
});
