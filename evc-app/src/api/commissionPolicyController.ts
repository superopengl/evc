
import { getRepository, getManager } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { CommissionUserPolicy } from '../entity/CommissionUserPolicy';
import { CommissionGlobalPolicy } from '../entity/CommissionGlobalPolicy';
import { v4 as uuidv4 } from 'uuid';

export const getCommissionUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id: userId } = req.params;

  const policy = await getRepository(CommissionUserPolicy).findOne({ userId });

  res.json(policy);
});

export const saveCommissionUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { user: { id } } = req as any;
  const { id: userId } = req.params;
  const percentage = +(req.body.percentage);
  assert(0 < percentage && percentage < 1, 400, 'percentage must be between 0 and 1.');

  const policy = new CommissionUserPolicy();
  policy.userId = userId;
  policy.percentage = percentage;
  policy.by = id;

  await getRepository(CommissionUserPolicy).save(policy);

  res.json();
});

export const deleteCommissionUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id: userId } = req.params;

  await getRepository(CommissionUserPolicy).delete(userId);

  res.json();
});

export const listCommissionGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const list = await getRepository(CommissionGlobalPolicy).find({
    order: {
      start: 'ASC',
      createdAt: 'DESC'
    }
  });
  res.json(list);
});

export const getCommissionGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const policy = await getRepository(CommissionGlobalPolicy).findOne(id);

  res.json(policy);
});

export const saveCommissionGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const policy = new CommissionGlobalPolicy();
  const { percentage } = req.body;
  assert(0 <= percentage && percentage <= 100, 400, 'Amount is out of range');
  Object.assign(
    policy,
    { id: uuidv4() },
    req.body,
    {
      active: false,
      by: id
    }
  );

  await getRepository(CommissionGlobalPolicy).save(policy);

  res.json();
});

export const enableCommissionGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { enabled } = req.body;

  if (enabled) {
    await getManager().transaction(async m => {
      await m.update(CommissionGlobalPolicy, { active: true }, { active: false });
      await m.update(CommissionGlobalPolicy, { id }, { active: true });
    });
  } else {
    await getRepository(CommissionGlobalPolicy).update(id, { active: false });
  }

  res.json();
});
