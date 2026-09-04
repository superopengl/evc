import dotenv from 'dotenv';
import path from 'path';
import { getDataSource } from './src/dataSource';

/**
 * The TypeORM 0.3+ CLI takes an explicit DataSource file (`-d`) instead of reading TYPEORM_*
 * from the environment itself. It also does not go through src/index.ts, so it has to load the
 * .env files the same way loadEnv() does before the options are built.
 */
const env = (process.env.NODE_ENV || 'dev').toLowerCase();
if (env !== 'prod' && env !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });
}
dotenv.config();

/**
 * Must be the same instance `getDataSource()` hands out, not a fresh DataSource: the seed
 * migrations call getRepository() from src/dataSource, and that resolves the singleton. A
 * second instance would leave those calls pointing at an uninitialized DataSource.
 */
export default getDataSource();
