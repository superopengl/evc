import { Portfolio } from '../entity/Portfolio';
import { getUtcNow } from './getUtcNow';

export function createProfileEntity(userId: string, payload: any): Portfolio {
  const profile = new Portfolio();
  profile.id = userId;
  profile.name = payload.name;
  profile.fields = payload.fields;
  profile.lastUpdatedAt = getUtcNow();

  return profile;
}
