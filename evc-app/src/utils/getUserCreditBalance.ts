import { EntityManager } from 'typeorm';
import { getRepository } from '../dataSource';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';

export async function getUserCreditBalance(userId) {
  const result = await getRepository(UserCreditTransaction)
    .createQueryBuilder()
    .where({ userId })
    .select('SUM(amount) as total')
    .execute();

  return +(result[0]?.total) || 0;
}
