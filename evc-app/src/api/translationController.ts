import { getManager, getRepository } from '../dataSource';

import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { fireAndForget } from '../utils/fireAndForget';
import { redisCache } from '../services/redisCache';
import { Translation } from '../entity/Translation';
import { Locale } from '../types/Locale';

function getCacheKey(locale) {
  const key = `i18n.resource.${locale}`;
  return key;
}

export const getAllLocaleResource = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const list = await getRepository(Translation)
    .createQueryBuilder('en')
    .where('en.locale = \'en-US\'')
    .leftJoin(q => q.from(Translation, 'cn').where('cn.locale = \'zh-CN\''), 'cn', 'en.key = cn.key')
    .leftJoin(q => q.from(Translation, 'tw').where('tw.locale = \'zh-TW\''), 'tw', 'en.key = tw.key')
    .orderBy('key', 'ASC')
    .select([
      'en.key as key',
      'en.value as "en-US"',
      'cn.value as "zh-CN"',
      'tw.value as "zh-TW"',
    ])
    .execute();
  res.json(list);
});

export const getLocaleResource = handlerWrapper(async (req, res) => {
  const { locale } = req.params;
  const cachekey = getCacheKey(locale);
  let data = await redisCache.get(cachekey);
  if (!data) {
    const repo = getRepository(Translation);
    let list = await repo.findBy({ locale: locale as Locale });
    if (!list.length) {
      list = await repo.findBy({ locale: Locale.English });
    }
    data = list.reduce((pre, curr) => {
      pre[curr.key] = curr.value;
      return pre;
    }, {});
    fireAndForget(redisCache.set(cachekey, data), 'cache locale resource');
  }

  res.json(data);
});


export const saveLocaleResourceItem = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { locale, key } = req.params;
  const { value } = req.body;
  assert(locale === Locale.English || locale == Locale.ChineseTraditional || locale == Locale.ChineseSimple, 400, `Unsupported locale ${locale}`);
  assert(value, 400, 'Translation value is empty');
  const item = new Translation();
  item.key = key;
  item.locale = locale as Locale;
  item.value = value;
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(Translation)
    .values(item)
    .orUpdate(['value'], ['key', 'locale'])
    .execute();

  const cacheKey = getCacheKey(locale);
  fireAndForget(redisCache.del(cacheKey), 'invalidate locale resource cache');
  res.json();
});

export const flushLocaleResource = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const tasks = [Locale.English, Locale.ChineseSimple, Locale.ChineseTraditional].map(locale => {
    const cacheKey = getCacheKey(locale);
    return redisCache.del(cacheKey);
  });
  await Promise.all(tasks);
  res.json();
});


export const newLocaleResource = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { key } = req.body;

  const entities = [Locale.English, Locale.ChineseSimple, Locale.ChineseTraditional].map(locale => {
    const entity = new Translation();
    entity.key = key;
    entity.locale = locale;
    entity.value = req.body[locale];
    return entity;
  });
  await getRepository(Translation).insert(entities);

  res.json();
});