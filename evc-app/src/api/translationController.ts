
import { getManager, getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { redisCache } from '../services/redisCache';
import { Translation } from '../entity/Translation';
import { Locale } from '../types/Locale';

function getCacheKey(locale) {
  const key = `i18n.resource.${locale}`;
  return key;
}

export const getAllLocaleResource = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const list = await getRepository(Translation).find({
    order: {
      key: 'ASC',
      locale: 'ASC'
    }
  });
  res.json(list);
});

export const getLocaleResource = handlerWrapper(async (req, res) => {
  const { locale } = req.params;
  const cachekey = getCacheKey(locale);
  let data = await redisCache.get(cachekey);
  if (!data) {
    const repo = getRepository(Translation);
    let list = await repo.find({ locale: locale as Locale });
    if (!list.length) {
      list = await repo.find({ locale: Locale.Engish });
    }
    data = list.reduce((pre, curr) => {
      pre[curr.key] = curr.value;
      return pre;
    }, {});
    redisCache.set(cachekey, data);
  }

  res.json(data);
});


export const saveLocaleResourceItem = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { locale, key } = req.params;
  const { value } = req.body;
  assert(locale === Locale.Engish || locale == Locale.ChineseTraditional || locale == Locale.ChineseSimple, 400, `Unsupported locale ${locale}`);
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
    .onConflict(`(key, locale) DO UPDATE SET value = excluded.value`)
    .execute();

  const cacheKey = getCacheKey(locale);
  redisCache.del(cacheKey);
  res.json();
});

export const flushLocaleResource = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const tasks = [Locale.Engish, Locale.ChineseTraditional, Locale.ChineseTraditional].map(locale => {
    const cacheKey = getCacheKey(locale);
    return redisCache.del(cacheKey);
  });
  await Promise.all(tasks);
  res.json();
});

