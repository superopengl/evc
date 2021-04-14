
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { ReferralCode } from '../entity/ReferralCode';
import { getUserCurrentSubscription } from '../utils/getUserCurrentSubscription';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';
import { ReferralUserPolicy } from '../entity/ReferralUserPolicy';
import { getCurrentReferralAmountForReferrer } from '../services/referralService';

export const createReferral = async (userId) => {
  const entity = new ReferralCode();
  entity.id = uuidv4();
  entity.userId = userId;
  await getRepository(ReferralCode).insert(entity);
  return entity;
};

const getAccountForUser = async (userId) => {
  // const user = await getRepository(User).findOne({ id: userId });
  const referralUrl = `${process.env.EVC_WEB_DOMAIN_NAME}/signup?code=${userId}`;

  const referralCount = await getRepository(User)
    .createQueryBuilder()
    .where({ referredBy: userId, everPaid: true })
    .getCount();

  const subscription = await getUserCurrentSubscription(userId);

  const credit = await getRepository(UserCreditTransaction)
    .createQueryBuilder()
    .where({ userId })
    .select('SUM(amount) AS amount')
    .getRawOne();


  const referralCommission = await getCurrentReferralAmountForReferrer(userId);

  const result = {
    subscription,
    referralCommission,
    referralUrl,
    referralCount,
    credit: +credit?.amount || 0
  };

  return result;
};

export const getAccount = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const result = await getAccountForUser(id);

  res.json(result);
});

export const getMyAccount = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id } } = req as any;
  const result = await getAccountForUser(id);

  res.json(result);
});


export const adjustCredit = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { amount } = req.body;
  if (amount !== 0) {
    const entity = new UserCreditTransaction();
    entity.id = uuidv4();
    entity.userId = id;
    entity.amount = amount;
    entity.type = 'adjust';

    await getRepository(UserCreditTransaction).insert(entity);
  }

  res.json();
});