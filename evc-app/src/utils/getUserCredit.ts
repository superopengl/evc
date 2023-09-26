import { getRepository, EntityManager } from 'typeorm';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';

export async function getUserCredit(entityManger: EntityManager, userId) {
  const repo = entityManger?.getRepository(UserCreditTransaction) ?? getRepository(UserCreditTransaction);
  const result = await repo
    .createQueryBuilder()
    .where({ userId })
    .select('SUM(amount) as total')
    .execute();

  return +(result[0]?.total) || 0;
}
