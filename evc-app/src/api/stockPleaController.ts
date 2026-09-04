import { getManager, getRepository } from '../dataSource';

import { handlerWrapper } from '../utils/asyncHandler';
import _ from 'lodash';
import { StockPlea } from '../entity/StockPlea';
import { getTableName, getQualifiedTableName } from '../utils/getTableName';
import { assertRole } from '../utils/assertRole';


export const submitStockPlea = handlerWrapper((req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  // Raw SQL because orUpdate() cannot express `count + 1`. createdAt relies on the column
  // default that @CreateDateColumn generates.
  const pleaTable = getQualifiedTableName(StockPlea);
  getManager()
    .query(
      `INSERT INTO ${pleaTable} AS t ("symbol", "count") VALUES ($1, 1)
       ON CONFLICT ("symbol") DO UPDATE SET "count" = t."count" + 1, "deletedAt" = NULL`,
      [symbol])
    .catch(() => { });

  res.json();
});

export const deleteStockPlea = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const symbol = req.params.symbol.toUpperCase();

  await getRepository(StockPlea).softDelete(symbol);

  res.json();
});

