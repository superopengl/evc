
import { getRepository } from 'typeorm';
import { Blog } from '../entity/Blog';
import { UserTag } from '../entity/UserTag';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';

export const saveUserTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const entity = new UserTag();
  Object.assign(entity, req.body);
  await getRepository(UserTag).save(entity);
  res.json();
});

export const listUserTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const list = await getRepository(UserTag).find({order: {name: 'ASC'}});
  res.json(list);
});

export const deleteUserTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(UserTag).delete(id);
  res.json();
});