import { EntitySchema, getRepository } from 'typeorm';

export function getTableName(entity: any): string {
  return getRepository(entity).metadata.tableName;
}
