
import { getManager, getRepository } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import _ from 'lodash';
import { StockPlea } from '../entity/StockPlea';
import { getTableName } from '../utils/getTableName';
import { assertRole } from "../utils/assertRole";


export const submitStockPlea = handlerWrapper((req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  getManager()
    .createQueryBuilder()
    .insert()
    .into(StockPlea)
    .values({ symbol, count: 1 })
    .onConflict(`(symbol) DO UPDATE SET count = ${getTableName(StockPlea)}.count + 1, "deletedAt" = NULL`)
    .execute()
    .catch(() => { });

  res.json();
});

export const deleteStockPlea = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const symbol = req.params.symbol.toUpperCase();

  await getRepository(StockPlea).softDelete(symbol);

  res.json();
});

