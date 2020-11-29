import { getRepository, getManager } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockPublish } from '../entity/StockPublish';
import { StockSupportShort } from '../entity/StockSupportShort';
import { StockResistanceShort } from '../entity/StockResistanceShort';
import { StockFairValue } from '../entity/StockFairValue';
import { v4 as uuidv4 } from 'uuid';
import { StockSupportLong } from '../entity/StockSupportLong';
import { StockResistanceLong } from '../entity/StockResistanceLong';
import { compareTrend } from '../utils/compareTrend';

export const listStockPublish = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockPublish).find({
    where: {
      symbol
    },
    order: {
      createdAt: 'DESC'
    },
    take: limit
  })

  res.json(list);
});

export const saveStockPublish = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;

  const { supportShortId, supportLongId, resistanceShortId, resistanceLongId, fairValueId } = req.body;
  assert(supportShortId, 400, 'supportShortId is not specified');
  assert(supportLongId, 400, 'supportLongId is not specified');
  assert(resistanceShortId, 400, 'resistanceShortId is not specified');
  assert(resistanceLongId, 400, 'resistanceLongId is not specified');
  assert(fairValueId, 400, 'fairValueId is not specified');

  await getManager().transaction(async trans => {
    const [supportShort, supportLong, resistanceShort, resistanceLong, fairValue] = await Promise.all([
      trans.getRepository(StockSupportShort).findOne(supportShortId),
      trans.getRepository(StockSupportLong).findOne(supportLongId),
      trans.getRepository(StockResistanceShort).findOne(resistanceShortId),
      trans.getRepository(StockResistanceLong).findOne(resistanceLongId),
      trans.getRepository(StockFairValue).findOne(fairValueId)
    ]);
    const pre = await trans.getRepository(StockPublish).findOne({
      where: {
        symbol
      },
      order: {
        createdAt: 'ASC'
      }
    });

    const publish = new StockPublish();
    publish.id = uuidv4();
    publish.symbol = symbol;
    publish.author = userId;
    publish.supportShortId = supportShortId;
    publish.supportLongId = supportLongId;
    publish.resistanceShortId = resistanceShortId;
    publish.resistanceLongId = resistanceLongId;
    publish.fairValueId = fairValueId;
    publish.supportShortLo = supportShort.lo;
    publish.supportShortLoTrend = compareTrend(supportShort.lo, pre?.supportShortLo) || pre?.supportShortLoTrend;
    publish.supportShortHi = supportShort.hi;
    publish.supportShortHiTrend = compareTrend(supportShort.hi, pre?.supportShortHi) || pre?.supportShortHiTrend;
    publish.supportLongLo = supportLong.lo;
    publish.supportLongLoTrend = compareTrend(supportLong.lo, pre?.supportLongLo) || pre?.supportLongLoTrend;
    publish.supportLongHi = supportLong.hi;
    publish.supportLongHiTrend = compareTrend(supportLong.hi, pre?.supportLongHi) || pre?.supportLongHiTrend;
    publish.resistanceShortLo = resistanceShort.lo;
    publish.resistanceShortLoTrend = compareTrend(resistanceShort.lo, pre?.resistanceShortLo) || pre?.resistanceShortLoTrend;
    publish.resistanceShortHi = resistanceShort.hi;
    publish.resistanceShortHiTrend = compareTrend(resistanceShort.hi, pre?.resistanceShortHi) || pre?.resistanceShortHiTrend;
    publish.resistanceLongLo = resistanceLong.lo;
    publish.resistanceLongLoTrend = compareTrend(resistanceLong.lo, pre?.resistanceLongLo) || pre?.resistanceLongLoTrend;
    publish.resistanceLongHi = resistanceLong.hi;
    publish.resistanceLongHiTrend = compareTrend(resistanceLong.hi, pre?.resistanceLongHi) || pre?.resistanceLongHiTrend;
    publish.fairValueLo = fairValue.lo;
    publish.fairValueLoTrend = compareTrend(fairValue.lo, pre?.fairValueLo) || pre?.fairValueLoTrend;
    publish.fairValueHi = fairValue.hi;
    publish.fairValueHiTrend = compareTrend(fairValue.hi, pre?.fairValueHi) || pre?.fairValueHiTrend;

    supportShort.published = true;
    supportLong.published = true;
    resistanceShort.published = true;
    resistanceLong.published = true;
    fairValue.published = true;

    await trans.save([publish, supportShort, supportLong, resistanceShort, resistanceLong, fairValue]);
  });

  res.json();
});
