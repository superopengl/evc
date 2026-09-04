import { getManager, getRepository } from '../dataSource';

import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { redisCache } from '../services/redisCache';
import { Translation } from '../entity/Translation';
import { Locale } from '../types/Locale';
import { Config } from '../entity/Config';

export const listConfig = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const list = await getRepository(Config).find({ order: { key: 'ASC' } });
  res.json(list);
});

export const saveConfig = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { key, value } = req.body;
  assert(key, 400, 'Translation value is empty');
  const item = new Config();
  item.key = key;
  item.value = value;
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(Config)
    .values(item)
    .orUpdate(['value'], ['key'])
    .execute();

  res.json();
});
