import { IsNull } from 'typeorm';
import { getRepository } from '../dataSource';
import { User } from '../entity/User';
import { assert } from './assert';
import { computeEmailHash } from './computeEmailHash';


export async function getActiveUserByEmail(email) {
  assert(email, 400, 'Invalid email');
  const emailHash = computeEmailHash(email);
  const user = await getRepository(User).findOne({
    where: { emailHash },
    relations: { profile: true },
  });
  return user;
}
