import { Connection, createConnection, getConnectionManager } from 'typeorm';
import { getManager } from 'typeorm';
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

export async function connectDatabase(shouldSyncSchema = true) {
  const connection = await createConnection();
  if (shouldSyncSchema) {
    await syncDatabaseSchema(connection);
  }
  await initializeData();
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
  const views = [
    StockLatestPaidInformation,
    StockLatestFreeInformation,
    SubscriptionPaymentBalanceInformation,
    StockComputedPe90,
    StockLastFairValue,
  ];
  const mviews = [
    StockDailyPe,
    StockHistoricalTtmEps,
    StockHistoricalComputedFairValue,
    StockPutCallRatio90,
  ];

  for (const viewEntity of views) {
    await dropView(connection, viewEntity);
  }

  for (const viewEntity of mviews) {
    await dropMaterializedView(connection, viewEntity);
  }

  await connection.synchronize(false);
  await connection.runMigrations();
}

async function dropView(connection: Connection, entity) {
  const { schema, tableName } = getManager().getRepository(entity).metadata;
  await connection.query(`DROP VIEW IF EXISTS "${schema}"."${tableName}" CASCADE`);
}

async function dropMaterializedView(connection: Connection, entity) {
  const { schema, tableName } = getManager().getRepository(entity).metadata;
  await connection.query(`DROP MATERIALIZED VIEW IF EXISTS "${schema}"."${tableName}" CASCADE`);
}
