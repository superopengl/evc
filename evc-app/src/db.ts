import { createConnection, getConnectionManager } from 'typeorm';

export async function connectDatabase() {
   return await createConnection();
}
