import { getRepository } from 'typeorm';
import { StockDailyPe } from '../entity/views/StockDailyPe';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { normalizeLoHiValues } from '../utils/normalizeLoHiValues';
import { v4 as uuidv4 } from 'uuid';
import { compareTrend } from '../utils/compareTrend';
import { StockComputedPe90 } from '../entity/views/StockComputedPe90';


export const listStockPe = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockDailyPe).find({
    where: {
      symbol
    },
    order: {
      date: 'DESC'
    },
    take: limit
  });

  res.json(list);
});
