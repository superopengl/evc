import { getRepository, getManager } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockPublish } from '../entity/StockPublish';
import { StockSpecialFairValue } from '../entity/StockSpecialFairValue';
import { v4 as uuidv4 } from 'uuid';
import { StockResistance } from '../entity/StockResistance';
import { StockSupport } from '../entity/StockSupport';
import { getUtcNow } from '../utils/getUtcNow';

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
  });

  res.json(list);
});

export const saveStockPublish = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;

  const { supportId, resistanceId, fairValueId } = req.body;
  assert(supportId, 400, 'supportId is not specified');
  assert(resistanceId, 400, 'resistanceId is not specified');
  assert(fairValueId, 400, 'fairValueId is not specified');

  await getManager().transaction(async trans => {
    const [support, resistance, fairValue] = await Promise.all([
      trans.getRepository(StockSupport).findOne(supportId),
      trans.getRepository(StockResistance).findOne(resistanceId),
      trans.getRepository(StockSpecialFairValue).findOne(fairValueId)
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
    publish.supportId = supportId;
    publish.resistanceId = resistanceId;
    publish.fairValueId = fairValueId;
    publish.supportLo = support.lo;
    publish.supportHi = support.hi;
    publish.resistanceLo = resistance.lo;
    publish.resistanceHi = resistance.hi;
    publish.fairValueLo = fairValue.fairValueLo;
    publish.fairValueHi = fairValue.fairValueHi;

    support.published = true;
    resistance.published = true;
    fairValue.published = getUtcNow();

    await trans.save([publish, support, resistance, fairValue]);
  });

  res.json();
});
