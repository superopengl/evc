import { getRepository, QueryRunner } from 'typeorm';
import { UserAliveSubscriptionSummary } from '../entity/views/UserAliveSubscriptionSummary';


export async function getUserCurrentSubscriptionInfo(userId: string, q?: QueryRunner): Promise<UserAliveSubscriptionSummary> { 
  const repo = q ? q.manager.getRepository(UserAliveSubscriptionSummary) : getRepository(UserAliveSubscriptionSummary);
  const subscription = await repo
  .createQueryBuilder()
  .where('"userId" = :id', {id: userId})
  .andWhere('CURRENT_DATE <= "end"')
  .getOne();

  return subscription;
}
