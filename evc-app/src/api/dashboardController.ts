import { getManager, getRepository } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assertRole } from "../utils/assertRole";
import { StockPlea } from '../entity/StockPlea';
import { StockLatestFairValue } from '../entity/views/StockLatestFairValue';
import { StockSupport } from '../entity/StockSupport';
import { StockResistance } from '../entity/StockResistance';
import { StockLatestPaidInformation } from '../entity/views/StockLatestPaidInformation';
import { Stock } from '../entity/Stock';
import { notExistsQuery } from '../utils/existsQuery';
import { StockDailyClose } from '../entity/StockDailyClose';


export const getAdminDashboard = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const m = getManager();

  const closeAlerts = await m
    .createQueryBuilder()
    .from(q => q
      .from(StockDailyClose, 'c')
      .distinctOn(['symbol'])
      .orderBy('symbol', 'DESC')
      .addOrderBy('date', 'DESC')
      .select([
        'symbol',
        'date',
        'close',
        '"createdAt"'
      ])
      , 'c')
    .where(`date < "createdAt"::date - 1`)
    .orderBy('date', 'DESC')
    .addOrderBy('symbol', 'ASC')
    .getRawMany();

  const pleas = await m
    .getRepository(StockPlea)
    .createQueryBuilder('p')
    .where(
      notExistsQuery(
        getRepository(Stock)
          .createQueryBuilder('s')
          .where('s.symbol = p.symbol')
      )
    )
    .andWhere('"deletedAt" IS NULl')
    .select([
      'symbol',
      'count'
    ])
    .orderBy('count', 'DESC')
    .getRawMany();

  const noFairValuesByInvalidTtmEps = await m
    .createQueryBuilder()
    .from(q => q
      .from(StockLatestFairValue, 'v')
      .where('"fairValueLo" IS NULL')
      .andWhere('"ttmEps" <= 0')
      .select('symbol')
      .orderBy('symbol'),
      'sub')
    .select('array_agg(symbol) as value')
    .getRawOne();

  const noFairValuesByMissingEpsData = await m
    .createQueryBuilder()
    .from(q => q
      .from(StockLatestFairValue, 'v')
      .where('"fairValueLo" IS NULL')
      .andWhere('"ttmEps" IS NULL')
      .select('symbol')
      .orderBy('symbol'),
      'sub')
    .select('array_agg(symbol) as value')
    .getRawOne();

  const oneSupports = await m
    .createQueryBuilder()
    .from(q => q
      .from(StockSupport, 'x')
      .groupBy('symbol')
      .having('COUNT(*) = 1')
      .select('symbol')
      .orderBy('symbol'),
      'sub'
    )
    .select('array_agg(symbol) as value')
    .getRawOne();

  const oneResistances = await m
    .createQueryBuilder()
    .from(q => q
      .from(StockResistance, 'x')
      .groupBy('symbol')
      .having('COUNT(*) = 1')
      .select('symbol')
      .orderBy('symbol'),
      'sub'
    )
    .select('array_agg(symbol) as value')
    .getRawOne();

  const noSupports = await m
    .createQueryBuilder()
    .from(q => q
      .from(StockLatestPaidInformation, 'v')
      .where('supports IS NULL')
      .select('symbol')
      .orderBy('symbol'),
      'sub')
    .select('array_agg(symbol) as value')
    .getRawOne();

  const noResistances = await m
    .createQueryBuilder()
    .from(q => q
      .from(StockLatestPaidInformation, 'v')
      .where('resistances IS NULL')
      .select('symbol')
      .orderBy('symbol'),
      'sub')
    .select('array_agg(symbol) as value')
    .getRawOne();

  const data = {
    closeAlerts,
    pleas,
    noFairValuesByInvalidTtmEps: noFairValuesByInvalidTtmEps.value,
    noFairValuesByMissingEpsData: noFairValuesByMissingEpsData.value,
    noSupports: noSupports.value,
    noResistances: noResistances.value,
    oneSupports: oneSupports.value,
    oneResistances: oneResistances.value,
  };

  res.json(data);
});
