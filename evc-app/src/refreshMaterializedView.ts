import { getManager, getRepository } from 'typeorm';
import { redisCache } from './services/redisCache';
import _ from 'lodash';
import { StockComputedPe90 } from './entity/views/StockComputedPe90';
import { StockDailyPe } from './entity/views/StockDailyPe';
import { StockDataInformation } from './entity/views/StockDataInformation';
import { StockHistoricalComputedFairValue } from './entity/views/StockHistoricalComputedFairValue';
import { StockHistoricalTtmEps } from './entity/views/StockHistoricalTtmEps';
import { StockLatestFairValue } from './entity/views/StockLatestFairValue';
import { StockComputedPe365 } from './entity/views/StockComputedPe365';

const REFRESHING_MV_CACHE_KEY = 'operation.status.refresh-mv'

const MV_REFRESH_ORDER = [
  StockHistoricalTtmEps,
  StockDailyPe,
  StockComputedPe90,
  StockComputedPe365,
  StockDataInformation,
  StockHistoricalComputedFairValue,
  StockLatestFairValue,
];

export async function refreshMaterializedView(mviewEnitity?: any) {
  const refreshing = await redisCache.get(REFRESHING_MV_CACHE_KEY);
  if (refreshing) {
    console.log('Other process is refreshing materialized view, skip this request');
    return;
  }
  try {
    await redisCache.set(REFRESHING_MV_CACHE_KEY, new Date().toUTCString());

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

    console.log('Start refreshing mv')
    await getManager().transaction(async (m) => {
      for (const item of sortedMviews) {
        await redisCache.set(REFRESHING_MV_CACHE_KEY, new Date().toUTCString());
        const { schema, tableName } = item;

        console.log(`Start refreshing ${tableName}`)
        await m.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY "${schema}"."${tableName}" `);
        console.log(`Done with refreshing ${tableName}`)
      }
    });

    // for (const item of list) {
    //   const { schema, tableName } = item;
    //   await getManager().query(`REFRESH MATERIALIZED VIEW CONCURRENTLY "${schema}"."${tableName}" `);
    // }
  } finally {
    await redisCache.del(REFRESHING_MV_CACHE_KEY);
    console.log('Done with refreshing mv')
  }
}
