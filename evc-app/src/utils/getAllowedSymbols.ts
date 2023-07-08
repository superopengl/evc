import { Role } from "../types/Role";
import { SubscriptionType } from "../types/SubscriptionType";
import { Subscription } from '../entity/Subscription';
import { User } from "../entity/User";
import { getUserCurrentSubscription } from "./getUserCurrentSubscription";

/**
 * 
 * @param user 
 * @returns null: not latest; *: all latest; string[]: selected latest
 */
export async function getAllowedSymbols(user: User): Promise<null | '*' | string[]> {
  if (!user) return null;
  const { role, id } = user;
  if (role !== Role.Client) return '*';

  const subscription = await getUserCurrentSubscription(id);
  if (!subscription) return null;

  const { type, symbols } = subscription;
  switch (type) {
    case SubscriptionType.Free:
      return null;
    case SubscriptionType.SelectedMonthly:
      return symbols ?? [];
    default:
      return '*';
  }
}
