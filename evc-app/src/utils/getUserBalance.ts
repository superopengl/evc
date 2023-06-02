import { getRepository, EntityManager } from 'typeorm';
import { UserBalanceTransaction } from '../entity/UserBalanceTransaction';

export async function getUserBalance(entityManger: EntityManager, userId) {
  const repo = entityManger?.getRepository(UserBalanceTransaction) ?? getRepository(UserBalanceTransaction);
  const result = await repo
    .createQueryBuilder()
    .where({ userId })
    .select('SUM(amount) as total')
    .execute();

  return +(result[0]?.total) || 0;
}
