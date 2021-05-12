
import { getRepository, getManager } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert, assertRole } from '../utils/assert';
import { ReferralUserPolicy } from '../entity/ReferralUserPolicy';
import { ReferralGlobalPolicy } from '../entity/ReferralGlobalPolicy';
import { v4 as uuidv4 } from 'uuid';

export const getReferralUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id: userId } = req.params;

  const policy = await getRepository(ReferralUserPolicy).findOne({ userId });

  res.json(policy);
});

export const saveReferralUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { user: { id } } = req as any;
  const { id: userId } = req.params;
  const amount = +(req.body.amount);
  assert(amount, 400, 'amount must be positive number');

  const policy = new ReferralUserPolicy();
  policy.userId = userId;
  policy.amount = amount;
  policy.by = id;

  await getRepository(ReferralUserPolicy).save(policy);

  res.json();
});

export const deleteReferralUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id: userId } = req.params;

  await getRepository(ReferralUserPolicy).delete(userId);

  res.json();
});

export const listReferralGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const list = await getRepository(ReferralGlobalPolicy).find({
    order: {
      start: 'ASC',
      createdAt: 'DESC'
    }
  });
  res.json(list);
});

export const getReferralGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const policy = await getRepository(ReferralGlobalPolicy).findOne(id);

  res.json(policy);
});

export const saveReferralGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const policy = new ReferralGlobalPolicy();
  const { amount } = req.body;
  assert(0 <= amount && amount <= 100, 400, 'Amount is out of range');
  Object.assign(
    policy,
    { id: uuidv4() },
    req.body,
    {
      active: false,
      by: id
    }
  );

  await getRepository(ReferralGlobalPolicy).save(policy);

  res.json();
});

export const enableReferralGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { enabled } = req.body;

  if (enabled) {
    await getManager().transaction(async m => {
      await m.update(ReferralGlobalPolicy, { active: true }, { active: false });
      await m.update(ReferralGlobalPolicy, { id }, { active: true });
    });
  } else {
    await getRepository(ReferralGlobalPolicy).update(id, { active: false });
  }

  res.json();
});
