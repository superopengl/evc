import { getManager, getRepository } from 'typeorm';
import { redisCache } from './services/redisCache';
import * as _ from 'lodash';
import { StockComputedPe90 } from './entity/views/StockComputedPe90';
import { StockDailyPe } from './entity/views/StockDailyPe';
import { StockDataInformation } from './entity/views/StockDataInformation';
import { StockHistoricalComputedFairValue } from './entity/views/StockHistoricalComputedFairValue';
import { StockHistoricalTtmEps } from './entity/views/StockHistoricalTtmEps';
import { StockLatestFairValue } from './entity/views/StockLatestFairValue';
import { StockPutCallRatio90 } from './entity/views/StockPutCallRatio90';

const REFRESHING_MV_CACHE_KEY = 'operation.status.refresh-mv'

const MV_REFRESH_ORDER = [
  StockHistoricalTtmEps,
  StockPutCallRatio90,
  StockDailyPe,
  StockComputedPe90,
  StockDataInformation,
  StockHistoricalComputedFairValue,
  StockLatestFairValue,
];

export async function refreshMaterializedView(mviewEnitity?: any) {
  const refreshing = await redisCache.get(REFRESHING_MV_CACHE_KEY);
  if (refreshing) {
    return;
  }
  try {
    await redisCache.set(REFRESHING_MV_CACHE_KEY, 'in-progress');

    const matviews = await getManager().query(`
select schemaname as schema, matviewname as "tableName"
from pg_catalog.pg_matviews 
where schemaname = 'evc'
      `);


    const mvRefreshOrder = new Map(MV_REFRESH_ORDER
      .map((x, i) => ([getRepository(x).metadata.tableName, i]))
    );

    const list = mviewEnitity ? [getManager().getRepository(mviewEnitity).metadata] : matviews;
    const sortedMviews = _.sortBy(list, x => mvRefreshOrder.get(x.tableName));
    await redisCache.setex(REFRESHING_MV_CACHE_KEY, 10 * 60, true);

    await getManager().transaction(async (m) => {
      for (const item of sortedMviews) {
        const { schema, tableName } = item;
        await m.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY "${schema}"."${tableName}" `);
      }
    });

    // for (const item of list) {
    //   const { schema, tableName } = item;
    //   await getManager().query(`REFRESH MATERIALIZED VIEW CONCURRENTLY "${schema}"."${tableName}" `);
    // }
  } finally {
    await redisCache.del(REFRESHING_MV_CACHE_KEY);
  }
}
