import { assert } from './assert';
import * as crypto from 'crypto';

/**
 * Never ever change this hash on prod !!!!
 */

export function computeUserSecret(password, salt) {
  // assert(password && salt, 500, 'Error in hashing password');
  const seed = `${password}.${salt}`;
  const hex = crypto.createHash('sha256').update(seed).digest('hex');
  return hex;
}

