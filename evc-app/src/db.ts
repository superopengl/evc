import { Connection, createConnection, getConnectionManager } from 'typeorm';
import { getManager } from 'typeorm';
import { StockComputedPe90 } from './entity/views/StockComputedPe90';
import { StockLastPublishInformation } from './entity/views/StockLastPublishInformation';
import { SubscriptionPaymentBalanceInformation } from './entity/views/SubscriptionPaymentBalanceInformation';
import { StockGuestPublishInformation } from './entity/views/StockGuestPublishInformation';
import { StockDailyPe } from './entity/views/StockDailyPe';
import { StockHistoricalComputedFairValue } from './entity/views/StockHistoricalFairValue';
import { StockLastFairValue } from './entity/views/StockLastFairValue';
import { StockHistoricalTtmEps } from './entity/views/StockHistoricalTtmEps';

export async function connectDatabase(shouldSyncSchema = true) {
   const connection = await createConnection();
   if (shouldSyncSchema) {
      await syncDatabaseSchema(connection);
   }
   return connection;
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
      StockLastPublishInformation,
      StockGuestPublishInformation,
      SubscriptionPaymentBalanceInformation,
      StockComputedPe90,
      StockLastFairValue,
   ];
   const mviews = [
      StockDailyPe,
      StockHistoricalTtmEps,
      StockHistoricalComputedFairValue,
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
