
import { getManager, getRepository } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assertRole } from '../utils/assert';
import { User } from '../entity/User';
import { StockPlea } from '../entity/StockPlea';
import { StockLastFairValue } from '../entity/views/StockLastFairValue';
import { StockSupport } from '../entity/StockSupport';
import { StockResistance } from '../entity/StockResistance';
import { StockLatestStockInformation } from '../entity/views/StockLatestStockInformation';


export const getAdminDashboard = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const pleas = await getRepository(StockPlea).find({
    order: {
      count: 'DESC'
    }
  });

  const noFairValues = await getManager()
    .createQueryBuilder()
    .from(StockLastFairValue, 'v')
    .where('"fairValueLo" IS NULL')
    .orderBy('symbol', 'ASC')
    .select('symbol')
    .limit(50)
    .execute();

  const oneSupports = await getRepository(StockSupport)
    .createQueryBuilder()
    .groupBy('symbol')
    .having(`COUNT(*) = 1`)
    .select('symbol')
    .orderBy('symbol', 'ASC')
    .limit(50)
    .execute();

  const oneResistances = await getRepository(StockResistance)
    .createQueryBuilder()
    .groupBy('symbol')
    .having(`COUNT(*) = 1`)
    .select('symbol')
    .orderBy('symbol', 'ASC')
    .limit(50)
    .execute();

  const noSupports = await getManager()
    .createQueryBuilder()
    .from(StockLatestStockInformation, 'v')
    .where('supports IS NULL')
    .orderBy('symbol', 'ASC')
    .limit(50)
    .execute();

  const noResistances = await getManager()
    .createQueryBuilder()
    .from(StockLatestStockInformation, 'v')
    .where('resistances IS NULL')
    .orderBy('symbol', 'ASC')
    .limit(50)
    .execute();

  const data = {
    pleas,
    noFairValues,
    noSupports,
    noResistances,
    oneSupports,
    oneResistances,
  };

  res.json(data);
});
