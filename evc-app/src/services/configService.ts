import { getRepository } from '../dataSource';
import { Config } from '../entity/Config';

export async function getConfigValue(key) {
  const { value } = await getRepository(Config).findOneBy({ key });
  return value;
}