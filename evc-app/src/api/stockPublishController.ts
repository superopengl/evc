import { getRepository, getManager } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockPublish } from '../entity/StockPublish';
import { StockSupportShort } from '../entity/StockSupportShort';
import { StockResistanceShort } from '../entity/StockResistanceShort';
import { StockValue } from '../entity/StockValue';
import { v4 as uuidv4 } from 'uuid';
import { StockSupportLong } from '../entity/StockSupportLong';
import { StockResistanceLong } from '../entity/StockResistanceLong';

export const listStockPublish = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockPublish)
    .createQueryBuilder('sp')
    .where({ symbol })
    .orderBy('sp."createdAt"', 'DESC')
    .limit(limit)
    .getMany();

  res.json(list);
});

export const saveStockPublish = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;

  const { supportShortId, supportLongId, resistanceShortId, resistanceLongId, valueId } = req.body;
  assert(supportShortId, 400, 'supportShortId is not specified');
  assert(supportLongId, 400, 'supportLongId is not specified');
  assert(resistanceShortId, 400, 'resistanceShortId is not specified');
  assert(resistanceLongId, 400, 'resistanceLongId is not specified');
  assert(valueId, 400, 'valueId is not specified');


  const [supportShort, supportLong, resistanceShort, resistanceLong, value] = await Promise.all([
    getRepository(StockSupportShort).findOne(supportShortId),
    getRepository(StockSupportLong).findOne(supportLongId),
    getRepository(StockResistanceShort).findOne(resistanceShortId),
    getRepository(StockResistanceLong).findOne(resistanceLongId),
    getRepository(StockValue).findOne(valueId),
  ]);

  const publish = new StockPublish();
  publish.id = uuidv4();
  publish.symbol = symbol;
  publish.author = userId;
  publish.supportShortId = supportShortId;
  publish.supportLongId = supportLongId;
  publish.resistanceShortId = resistanceShortId;
  publish.resistanceLongId = resistanceLongId;
  publish.valueId = valueId;
  publish.valueLo = value.lo;
  publish.valueHi = value.hi;
  publish.supportShortLo = supportShort.lo;
  publish.supportShortHi = supportShort.hi;
  publish.supportLongLo = supportLong.lo;
  publish.supportLongHi = supportLong.hi;
  publish.resistanceShortLo = resistanceShort.lo;
  publish.resistanceShortHi = resistanceShort.hi;
  publish.resistanceLongLo = resistanceLong.lo;
  publish.resistanceLongHi = resistanceLong.hi;

  await getRepository(StockPublish).insert(publish);

  res.json();
});
