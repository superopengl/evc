import { getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockSupportShort } from '../entity/StockSupportShort';
import { StockSupportLong } from '../entity/StockSupportLong';
import { StockResistanceShort } from '../entity/StockResistanceShort';
import { StockResistanceLong } from '../entity/StockResistanceLong';
import { compareTrend } from '../utils/compareTrend';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';

function factoryListHandler(EntityType) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, 'admin', 'agent');
    const { symbol } = req.params;
    const limit = +req.query.limit || 6;

    const list = await getRepository(EntityType).find({
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
}

function facatorySaveHandler(EntityType) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, 'admin', 'agent');
    const { symbol } = req.params;
    const { user: { id: userId } } = req as any;
    const { lo, hi } = normalizeLoHiValues(req.body);

    const repo = getRepository(EntityType);
    const pre = await repo.findOne({
      where: {
        symbol
      },
      order: {
        createdAt: 'DESC'
      }
    }) as any;
    const entity = new EntityType();
    entity.symbol = symbol;
    entity.author = userId;
    entity.lo = lo;
    entity.hi = hi;

    entity.loTrend = compareTrend(lo, pre?.lo) || pre?.loTrend;
    entity.hiTrend = compareTrend(hi, pre?.hi) || pre?.hiTrend;

    await repo.insert(entity);

    res.json();
  });
}

function factoryDeleteHandler(EntityType) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, 'admin', 'agent');
    const { id } = req.params;
    await getRepository(EntityType).delete({ id, published: false });
    res.json();
  });
}


export const listStockSupportShort = factoryListHandler(StockSupportShort);

export const saveStockSupportShort = facatorySaveHandler(StockSupportShort);

export const deleteStockSupportShort = factoryDeleteHandler(StockSupportShort);

export const listStockSupportLong = factoryListHandler(StockSupportLong);

export const saveStockSupportLong = facatorySaveHandler(StockSupportLong);

export const deleteStockSupportLong = factoryDeleteHandler(StockSupportLong);

export const listStockResistanceShort = factoryListHandler(StockResistanceShort);

export const saveStockResistanceShort = facatorySaveHandler(StockResistanceShort);

export const deleteStockResistanceShort = factoryDeleteHandler(StockResistanceShort);

export const listStockResistanceLong = factoryListHandler(StockResistanceLong);

export const saveStockResistanceLong = facatorySaveHandler(StockResistanceLong);

export const deleteStockResistanceLong = factoryDeleteHandler(StockResistanceLong);