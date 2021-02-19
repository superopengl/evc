
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
    },
    select: [
      'symbol',
      'count'
    ]
  });

  const noFairValues = await getManager()
    .createQueryBuilder()
    .from(q => q
      .from(StockLastFairValue, 'v')
      .where('"fairValueLo" IS NULL')
      .select('symbol'),
      'sub')
    .select('array_agg(symbol) as value')
    .getRawOne();

  const oneSupports = await getManager()
    .createQueryBuilder()
    .from(q => q
      .from(StockSupport, 'x')
      .groupBy('symbol')
      .having(`COUNT(*) = 1`)
      .select('symbol'),
      'sub'
    )
    .select('array_agg(symbol) as value')
    .getRawOne();

  const oneResistances = await getManager()
    .createQueryBuilder()
    .from(q => q
      .from(StockResistance, 'x')
      .groupBy('symbol')
      .having(`COUNT(*) = 1`)
      .select('symbol'),
      'sub'
    )
    .select('array_agg(symbol) as value')
    .getRawOne();

  const noSupports = await getManager()
    .createQueryBuilder()
    .from(q => q
      .from(StockLatestStockInformation, 'v')
      .where('supports IS NULL')
      .select('symbol'),
      'sub')
    .select('array_agg(symbol) as value')
    .getRawOne();

  const noResistances = await getManager()
    .createQueryBuilder()
    .from(q => q
      .from(StockLatestStockInformation, 'v')
      .where('resistances IS NULL')
      .select('symbol'),
      'sub')
    .select('array_agg(symbol) as value')
    .getRawOne();

  const data = {
    pleas,
    noFairValues : noFairValues.value,
    noSupports: noSupports.value,
    noResistances: noResistances.value,
    oneSupports: oneSupports.value,
    oneResistances: oneResistances.value,
  };

  res.json(data);
});
