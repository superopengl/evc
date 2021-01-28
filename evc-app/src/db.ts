import { createConnection, getConnectionManager } from 'typeorm';

export async function connectDatabase() {
   const connection = await createConnection();
   // await connection.query(`DROP VIEW IF EXISTS public."stock_daily_pe"`);
   // await connection.query(`DROP VIEW IF EXISTS public."stock_computed_pe"`);
   // await connection.synchronize(true);
   return connection;
}
