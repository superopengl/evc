import { Connection, createConnection, getManager, getRepository } from 'typeorm';
import { StockComputedPe90 } from './entity/views/StockComputedPe90';
import { StockHistoricalComputedFairValue } from './entity/views/StockHistoricalComputedFairValue';
import { StockLatestFairValue } from './entity/views/StockLatestFairValue';
import { StockHistoricalTtmEps } from './entity/views/StockHistoricalTtmEps';
import { initializeEmailTemplates } from "./utils/initializeEmailTemplates";
import { initializeConfig } from './utils/initializeConfig';
import { StockPutCallRatio90 } from './entity/views/StockPutCallRatio90';
import { StockDataInformation } from './entity/views/StockDataInformation';
import { redisCache } from './services/redisCache';
import { StockDailyPe } from './entity/views/StockDailyPe';

export async function connectDatabase(shouldSyncSchema = false) {
  const connection = await createConnection();
  if (shouldSyncSchema) {
    await syncDatabaseSchema(connection);
    await initializeData();
  }
  return connection;
}

async function initializeData() {
  await initializeConfig();
  await initializeEmailTemplates();
}

async function syncDatabaseSchema(connection: Connection) {
  /**
   * We have to drop all views manually before typeorm sync up the database schema,
   * because typeorm cannot handle the view dependencies (view A depends on view B) correctly
   * and drop views in correct order.
   *
   * As a result, we have to drop all views/materialized views before hand,
   * so as to let typeorm always create fresh views when app starts up.
   */

  await dropAllViewsAndMatviews();

  await connection.synchronize(false);
  await connection.runMigrations();

  await createIndexOnMaterilializedView();
  // await refreshMaterializedView();
}

async function dropAllViewsAndMatviews() {
  const list = await getManager().query(`
select format('DROP VIEW IF EXISTS "%I"."%I" cascade;', schemaname, viewname) as sql
from pg_catalog.pg_views 
where schemaname = 'evc'
union 
select format('DROP MATERIALIZED VIEW IF EXISTS "%I"."%I" cascade;', schemaname, matviewname) as sql
from pg_catalog.pg_matviews 
where schemaname = 'evc'
  `);

  for (const item of list) {
    await getManager().query(item.sql);
  }
}

async function createIndexOnMaterilializedView() {
  const list: { tableEntity: any, fields: string[], unique?: boolean }[] = [
    {
      tableEntity: StockDataInformation,
      fields: ['symbol'],
      unique: true,
    },
    {
      tableEntity: StockLatestFairValue,
      fields: ['symbol'],
      unique: true,
    },
    {
      tableEntity: StockDailyPe,
      fields: ['symbol', 'date'],
      unique: true,
    },
    {
      tableEntity: StockComputedPe90,
      fields: ['symbol', 'date'],
      unique: true,
    },
    {
      tableEntity: StockHistoricalComputedFairValue,
      fields: ['symbol', '"reportDate"'],
      unique: true,
    },
    {
      tableEntity: StockHistoricalTtmEps,
      fields: ['symbol', '"reportDate"'],
      unique: true,
    },
    {
      tableEntity: StockPutCallRatio90,
      fields: ['symbol', 'date'],
      unique: true,
    },
  ];

  for (const item of list) {
    const { schema, tableName } = getRepository(item.tableEntity).metadata;
    const idxName = `${tableName}_${item.fields.map(x => x.replace(/"/g, '')).join('_')}`;
    const fields = item.fields.join(',');
    await getManager().query(`CREATE ${item.unique ? 'UNIQUE' : ''} INDEX ${idxName} ON "${schema}"."${tableName}" (${fields})`);
  }
}

const REFRESHING_MV_CACHE_KEY = 'database.mv.refreshing'

export async function refreshMaterializedView(mviewEnitity?: any) {
  const refreshing = await redisCache.get(REFRESHING_MV_CACHE_KEY);
  if (refreshing) {
    return;
  }
  try {
    const matviews = await getManager().query(`
select schemaname as schema, matviewname as "tableName"
from pg_catalog.pg_matviews 
where schemaname = 'evc'
      `);

    const list = mviewEnitity ? [getManager().getRepository(mviewEnitity).metadata] : matviews;

    await redisCache.setex(REFRESHING_MV_CACHE_KEY, 10 * 60, true);

    await getManager().transaction(async m => {
      for (const item of list) {
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
