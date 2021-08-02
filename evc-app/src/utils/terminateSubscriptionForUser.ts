import { SubscriptionStatus } from './../types/SubscriptionStatus';
import { getManager, IsNull } from 'typeorm';
import { Subscription } from '../entity/Subscription';
import { User } from '../entity/User';
import { Role } from '../types/Role';

export async function terminateSubscriptionForUser(userId: string) {
  await getManager().transaction(async m => {
    await m.update(Subscription, {
      userId,
      status: SubscriptionStatus.Alive
    }, {
      status: SubscriptionStatus.Terminated,
      end: () => `NOW()`
    });

    await m.update(User, {
      id: userId,
      role: Role.Member,
      deletedAt: IsNull(),
    }, {
      role: Role.Free
    });
  });
}
