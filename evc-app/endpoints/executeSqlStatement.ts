import { getManager } from 'typeorm';
import { assert } from '../src/utils/assert';

export async function executeSqlStatement<T>(dataSource: T[], composeSingleLine: (item: T) => string) {
  assert(dataSource && dataSource.length, 400, 'Empty dataSource for executeSqlStatement');
  const sql = dataSource.map(composeSingleLine).join(';\n');
  return await getManager().query(sql);
}