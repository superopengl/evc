
import { getRepository, getManager } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { DiscountUserPolicy } from '../entity/DiscountUserPolicy';
import { DiscountGlobalPolicy } from '../entity/DiscountGlobalPolicy';
import { v4 as uuidv4 } from 'uuid';

export const getDiscountUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id: userId } = req.params;

  const policy = await getRepository(DiscountUserPolicy).findOne({ userId });

  res.json(policy);
});

export const saveDiscountUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { user: { id } } = req as any;
  const { id: userId } = req.params;
  const percentage = +(req.body.percentage);
  assert(0 < percentage && percentage < 1, 400, 'percentage must be between 0 and 1.');

  const policy = new DiscountUserPolicy();
  policy.userId = userId;
  policy.percentage = percentage;
  policy.by = id;

  await getRepository(DiscountUserPolicy).save(policy);

  res.json();
});

export const deleteDiscountUserPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id: userId } = req.params;

  await getRepository(DiscountUserPolicy).delete(userId);

  res.json();
});

export const listDiscountGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const list = await getRepository(DiscountGlobalPolicy).find({
    order: {
      start: 'ASC',
      createdAt: 'DESC'
    }
  });
  res.json(list);
});

export const getDiscountGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const policy = await getRepository(DiscountGlobalPolicy).findOne(id);

  res.json(policy);
});

export const saveDiscountGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const policy = new DiscountGlobalPolicy();
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

  await getRepository(DiscountGlobalPolicy).save(policy);

  res.json();
});

export const enableDiscountGlobalPolicy = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { enabled } = req.body;

  if (enabled) {
    await getManager().transaction(async m => {
      await m.update(DiscountGlobalPolicy, { active: true }, { active: false });
      await m.update(DiscountGlobalPolicy, { id }, { active: true });
    });
  } else {
    await getRepository(DiscountGlobalPolicy).update(id, { active: false });
  }

  res.json();
});
