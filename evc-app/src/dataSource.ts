import { DataSource, DataSourceOptions, EntityManager, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

/**
 * TypeORM 0.3 removed the TYPEORM_* environment auto-config that 0.2's ConnectionOptionsEnvReader
 * provided, and 1.x removed the getRepository/getManager/getConnection globals on top of that.
 *
 * Both `evc-app/.env` and the separately deployed `devops/.env.prod` still supply the TYPEORM_*
 * vars, and .env.prod ships outside the image, so this reproduces the old reader's coercion rules
 * rather than changing the ops contract.
 *
 * One rule matters more than the rest: 0.2's OrmUtils.toBoolean accepted only 'true' and '1'.
 * TYPEORM_DROP_SCHEMA is literally `evc` in both env files (someone meant TYPEORM_SCHEMA), which
 * has therefore always read as false. Do NOT "fix" this to a truthy/defined check - that would
 * drop the evc schema, and every materialized view in it, on each connect.
 */
const readString = (name: string) => process.env[name];

const readBoolean = (name: string) => {
  const value = process.env[name];
  return value === 'true' || value === '1';
};

const readNumber = (name: string) => {
  const value = process.env[name];
  return value ? parseInt(value, 10) : undefined;
};

const readArray = (name: string) => {
  const value = process.env[name];
  return value ? value.split(',').map(x => x.trim()) : [];
};

const readLogging = (name: string) => {
  const value = process.env[name];
  if (value === 'true' || value === 'TRUE' || value === '1') {
    return true;
  }
  if (value === 'all') {
    return 'all' as const;
  }
  return readArray(name) as DataSourceOptions['logging'];
};

export function buildDataSourceOptions(): DataSourceOptions {
  const driverExtra = readString('TYPEORM_DRIVER_EXTRA');
  return {
    type: (readString('TYPEORM_CONNECTION') || 'postgres') as 'postgres',
    host: readString('TYPEORM_HOST'),
    port: readNumber('TYPEORM_PORT'),
    username: readString('TYPEORM_USERNAME'),
    password: readString('TYPEORM_PASSWORD'),
    database: readString('TYPEORM_DATABASE'),
    schema: readString('TYPEORM_SCHEMA'),
    extra: driverExtra ? JSON.parse(driverExtra) : undefined,
    synchronize: readBoolean('TYPEORM_SYNCHRONIZE'),
    dropSchema: readBoolean('TYPEORM_DROP_SCHEMA'),
    migrationsRun: readBoolean('TYPEORM_MIGRATIONS_RUN'),
    entities: readArray('TYPEORM_ENTITIES'),
    migrations: readArray('TYPEORM_MIGRATIONS'),
    migrationsTableName: readString('TYPEORM_MIGRATIONS_TABLE_NAME'),
    logging: readLogging('TYPEORM_LOGGING'),
    maxQueryExecutionTime: readNumber('TYPEORM_MAX_QUERY_EXECUTION_TIME'),
  };
}

let dataSource: DataSource | undefined;

/**
 * Built lazily on first use. `src/index.ts` imports the controller graph - and therefore this
 * module - before `loadEnv()` runs dotenv, so reading process.env at module scope would capture
 * it empty.
 */
export function getDataSource(): DataSource {
  if (!dataSource) {
    dataSource = new DataSource(buildDataSourceOptions());
  }
  return dataSource;
}

/** Stand-ins for the 0.2 globals, so the ~350 existing call sites keep their shape. */
export function getConnection(): DataSource {
  return getDataSource();
}

export function getManager(): EntityManager {
  return getDataSource().manager;
}

export function getRepository<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): Repository<Entity> {
  return getDataSource().getRepository(target);
}
