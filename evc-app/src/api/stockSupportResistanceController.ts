import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockSupportShort } from '../entity/StockSupportShort';
import { StockSupportLong } from '../entity/StockSupportLong';
import { StockResistanceShort } from '../entity/StockResistanceShort';
import { StockResistanceLong } from '../entity/StockResistanceLong';

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
    const { lo, hi } = req.body;
    const entity = new EntityType();
    Object.assign(entity, {
      symbol,
      author: userId,
      lo,
      hi
    });

    await getRepository(EntityType).insert(entity);

    res.json();
  });
}

function factoryDeleteHandler(EntityType) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, 'admin', 'agent');
    const { id } = req.params;
    await getRepository(EntityType).delete(id);
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