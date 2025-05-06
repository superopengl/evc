import { getRepository } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { compareTrend } from '../utils/compareTrend';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';
import { StockSupport } from '../entity/StockSupport';
import { StockResistance } from '../entity/StockResistance';

function factoryListHandler(EntityType) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, 'admin', 'agent');
    const { symbol } = req.params;
    const limit = +req.query.limit || 100;

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
    const entity = new EntityType();
    entity.symbol = symbol;
    entity.lo = lo;
    entity.hi = hi;

    await repo.insert(entity);

    res.json();
  });
}

export const listStockSupport = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 100;

  const list = await getRepository(StockSupport).find({
    where: {
      symbol
    },
    order: {
      lo: 'DESC'
    },
    take: limit
  });

  res.json(list);
});;

export const saveStockSupport = facatorySaveHandler(StockSupport);

export const deleteStockSupport = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockSupport).delete(id);
  res.json();
});

export const listStockResistance = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 100;

  const list = await getRepository(StockResistance).find({
    where: {
      symbol
    },
    order: {
      lo: 'ASC'
    },
    take: limit
  });

  res.json(list);
});;

export const saveStockResistance = facatorySaveHandler(StockResistance);

export const deleteStockResistance = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  await getRepository(StockResistance).delete(id);
  res.json();
});

