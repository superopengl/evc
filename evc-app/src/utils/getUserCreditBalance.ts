import { getRepository, EntityManager } from 'typeorm';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';

export async function getUserCreditBalance(userId) {
  const result = await getRepository(UserCreditTransaction)
    .createQueryBuilder()
    .where({ userId })
    .select('SUM(amount) as total')
    .execute();

  return +(result[0]?.total) || 0;
}
