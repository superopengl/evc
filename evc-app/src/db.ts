import { Connection, createConnection, getManager, getRepository } from 'typeorm';
import { StockComputedPe90 } from './entity/views/StockComputedPe90';
import { StockLatestPaidInformation } from './entity/views/StockLatestPaidInformation';
import { SubscriptionPaymentBalanceInformation } from './entity/views/SubscriptionPaymentBalanceInformation';
import { StockLatestFreeInformation } from './entity/views/StockLatestFreeInformation';
import { StockDailyPe } from './entity/views/StockDailyPe';
import { StockHistoricalComputedFairValue } from './entity/views/StockHistoricalComputedFairValue';
import { StockLastFairValue } from './entity/views/StockLastFairValue';
import { StockHistoricalTtmEps } from './entity/views/StockHistoricalTtmEps';
import { initializeEmailTemplates } from "./utils/initializeEmailTemplates";
import { initializeConfig } from './utils/initializeConfig';
import { StockPutCallRatio90 } from './entity/views/StockPutCallRatio90';
import { StockDataInformation } from './entity/views/StockDataInformation';
import { StockDeprecateSupport } from './entity/views/StockDeprecateSupport';

const views = [
  StockLatestPaidInformation,
  StockLatestFreeInformation,
  SubscriptionPaymentBalanceInformation,
  StockDeprecateSupport,
];
const mviews = [
  StockDataInformation,
  StockLastFairValue,
  StockDailyPe,
  StockComputedPe90,
  StockHistoricalTtmEps,
  StockHistoricalComputedFairValue,
  StockPutCallRatio90,
];

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

  await dropView();

  await dropMaterializedView();

  await connection.synchronize(false);
  await connection.runMigrations();

  await createIndexOnMaterilializedView();
  // await refreshMaterializedView();
}

async function dropView() {
  for (const viewEntity of views) {
    const { schema, tableName } = getManager().getRepository(viewEntity).metadata;
    await getManager().query(`DROP VIEW IF EXISTS "${schema}"."${tableName}" CASCADE`);
  }
}

async function dropMaterializedView() {
  for (const viewEntity of mviews) {
    const { schema, tableName } = getManager().getRepository(viewEntity).metadata;
    await getManager().query(`DROP MATERIALIZED VIEW IF EXISTS "${schema}"."${tableName}" CASCADE`);
  }
}

async function createIndexOnMaterilializedView() {
  const list: { tableEntity: any, fields: string[] }[] = [
    {
      tableEntity: StockDataInformation,
      fields: ['symbol'],
    },
    {
      tableEntity: StockLastFairValue,
      fields: ['symbol'],
    },
    {
      tableEntity: StockComputedPe90,
      fields: ['symbol', 'date'],
    },
    {
      tableEntity: StockDailyPe,
      fields: ['symbol', 'date'],
    },
    {
      tableEntity: StockHistoricalComputedFairValue,
      fields: ['symbol', '"reportDate"'],
    },
    {
      tableEntity: StockHistoricalTtmEps,
      fields: ['symbol', '"reportDate"'],
    },
    {
      tableEntity: StockPutCallRatio90,
      fields: ['symbol', 'date'],
    },
  ];

  for (const item of list) {
    const { schema, tableName } = getRepository(item.tableEntity).metadata;
    const idxName = `${tableName}_${item.fields.map(x => x.replace(/"/g, '')).join('_')}`;
    const fields = item.fields.join(',');
    await getManager().query(`CREATE INDEX ${idxName} ON "${schema}"."${tableName}" (${fields})`);
  }
}

export async function refreshMaterializedView(mviewEnitity?: any) {
  const targetViews = mviewEnitity ? [mviewEnitity] : mviews;
  for (const viewEntity of targetViews) {
    const { schema, tableName } = getManager().getRepository(viewEntity).metadata;
    await getManager().query(`REFRESH MATERIALIZED VIEW "${schema}"."${tableName}"`);
  }
}
