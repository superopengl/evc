import { getRepository } from '../dataSource';

export function getTableName(entity: any): string {
  return getRepository(entity).metadata.tableName;
}

/**
 * Schema-qualified and quoted, for the handful of raw upserts that TypeORM 1.x can no longer
 * express: `orUpdate()` only emits `col = EXCLUDED.col`, so counter increments
 * (`count = count + 1`) have to be written as SQL.
 */
export function getQualifiedTableName(entity: any): string {
  const { schema, tableName } = getRepository(entity).metadata;
  return schema ? `"${schema}"."${tableName}"` : `"${tableName}"`;
}
