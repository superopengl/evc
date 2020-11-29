import { assert } from './assert';
import * as crypto from 'crypto';

/**
 * Never ever change this hash on prod !!!!
 */
export const EMAIL_HASH_NAMESPACE = '3b11c365-5113-47a1-9215-83b4f0debb3c';

export function computeUserSecret(password, salt) {
  // assert(password && salt, 500, 'Error in hashing password');
  const seed = `${password}.${salt}`;
  const hex = crypto.createHash('sha256').update(seed).digest('hex');
  return hex;
}

