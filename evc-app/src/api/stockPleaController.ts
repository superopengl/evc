
import { getManager } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
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

