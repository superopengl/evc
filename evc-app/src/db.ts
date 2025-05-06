import { StockComputedPe90 } from './entity/views/StockComputedPe90';
import { Connection, createConnection, getManager, getRepository } from 'typeorm';
import { StockHistoricalComputedFairValue } from './entity/views/StockHistoricalComputedFairValue';
import { StockLatestFairValue } from './entity/views/StockLatestFairValue';
import { StockHistoricalTtmEps } from './entity/views/StockHistoricalTtmEps';
import { initializeEmailTemplates } from './utils/initializeEmailTemplates';
import { initializeConfig } from './utils/initializeConfig';
import { StockDataInformation } from './entity/views/StockDataInformation';
import { StockDailyPe } from './entity/views/StockDailyPe';
import { StockComputedPe365 } from './entity/views/StockComputedPe365';
import { initializeIndexDef } from './utils/initializeIndexDef';

export async function connectDatabase(shouldSyncSchema = false) {
  const connection = await createConnection();
  if (shouldSyncSchema) {
    await syncDatabaseSchema(connection);
    await initializeData(connection);
  }
  return connection;
}

async function initializeData(connection) {
  await initializeIndexDef(connection);
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
  const list: { tableEntity: any; fields: string[]; unique?: boolean }[] = [
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
      tableEntity: StockComputedPe365,
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
  ];

  for (const item of list) {
    const { schema, tableName } = getRepository(item.tableEntity).metadata;
    const idxName = `${tableName}_${item.fields.map(x => x.replace(/"/g, '')).join('_')}`;
    const fields = item.fields.join(',');
    await getManager().query(`CREATE ${item.unique ? 'UNIQUE' : ''} INDEX ${idxName} ON "${schema}"."${tableName}" (${fields})`);
  }
}



