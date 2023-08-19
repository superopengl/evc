
import { getManager, getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { RedisRealtimePricePubService } from '../services/RedisPubSubService';
import * as _ from 'lodash';
import { StockPlea } from '../entity/StockPlea';
import { getTableName } from '../utils/getTableName';


export const submitStockPlea = handlerWrapper((req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  getManager()
    .createQueryBuilder()
    .insert()
    .into(StockPlea)
    .values({ symbol, count: 1 })
    .onConflict(`(symbol) DO UPDATE SET count = ${getTableName(StockPlea)}.count + 1`)
    .execute()
    .catch(() => { });

  res.json();
});

export const existsStockPlea = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const symbol = req.params.symbol.toUpperCase();

  await getRepository(StockPlea).softDelete(symbol);

  res.json();
});

export const listStockPleas = handlerWrapper(async (req, res) => {
  const list = await getRepository(StockPlea).find({
    order: {
      count: 'DESC'
    }
  });
  res.json(list);
});
