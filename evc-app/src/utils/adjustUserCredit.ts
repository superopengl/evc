import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';


export async function adjustUserCredit(userId, amount) {
  if (amount !== 0) {
    const entity = new UserCreditTransaction();
    entity.id = uuidv4();
    entity.userId = userId;
    entity.amount = amount;

    await getRepository(UserCreditTransaction).insert(entity);
  }
}
