import { v5 as uuidv5 } from 'uuid';
import { EMAIL_HASH_NAMESPACE } from './computeUserSecret';


export function computeEmailHash(email: string): string {
  const formatted = email.trim().toLowerCase();
  return uuidv5(formatted, EMAIL_HASH_NAMESPACE);
}
