
import { getRepository, getManager, MoreThan } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert, assertRole } from '../utils/assert';
import { User } from '../entity/User';
import { ReferralGlobalPolicy } from '../entity/ReferralGlobalPolicy';
import { getUtcNow } from '../utils/getUtcNow';
import { v4 as uuidv4 } from 'uuid';
import { CommissionWithdrawal } from '../entity/CommissionWithdrawal';
import * as moment from 'moment';

export const searchCommissionWithdrawal = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { userId, after, before, status, page, size } = req.body;

  const pageNo = +page || 1;
  const pageSize = +size || 60;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getRepository(CommissionWithdrawal)
    .createQueryBuilder('x')
    .where(`1=1`)

  if (userId) {
    query = query.andWhere(`"userId" = :userId`, { userId });
  }
  if (after) {
    query = query.andWhere(`"createdAt" >= :date`, { date: moment(after).startOf('day') })
  }
  if (before) {
    query = query.andWhere(`"createdAt" <= :date`, { date: moment(before).startOf('day') })
  }
  if (status) {
    query = query.andWhere(`status = :status`, { status })
  }

  const count = await query.getCount();
  const data = await query
    .orderBy('"createdAt"', 'DESC')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize)
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
  const { user: { id: userId } } = req as any;
  const entity = new CommissionWithdrawal();
  Object.assign(
    entity,
    req.body,
    {
      id:  uuidv4(),
      userId,
    }
  );
  await getRepository(CommissionWithdrawal).insert(entity);

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

export const changeCommissionWithdrawalStatus = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { status } = req.body;

  const application = await getRepository(CommissionWithdrawal).findOne(id);
  assert(application, 404);

  switch (application.status) {
    case 'submitted':
      if (['rejected', 'done'].includes(status)) {
        application.status = status;
        await getManager().save(application);
      } else {
        assert(false, 400, `Unknown target status ${status}`);
      }

    case 'rejected':
    case 'done':
      assert(false, 400, `This commission withdrawal application was finished already`);
      break;
    default:
      assert(false, 500, `Unknown status ${application.status}`);
  }

  res.json();
});
