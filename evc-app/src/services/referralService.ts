import * as aws from 'aws-sdk';
import { awsConfig } from '../utils/awsConfig';
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import * as Email from 'email-templates';
import * as path from 'path';
import { logError } from '../utils/logger';
import { EntityManager, getRepository, MoreThan } from 'typeorm';
import { User } from '../entity/User';
import { ReferralUserPolicy } from '../entity/ReferralUserPolicy';
import { ReferralGlobalPolicy } from '../entity/ReferralGlobalPolicy';
import { getUtcNow } from '../utils/getUtcNow';
import { UserBalanceTransaction } from '../entity/UserBalanceTransaction';

export async function getCurrentReferralAmountForReferrer(userId) {
  const policy = await getRepository(ReferralUserPolicy).findOne(userId);
  if (policy) {
    return policy.amount;
  }

  const now = getUtcNow();
  const globalPolicy = await getRepository(ReferralGlobalPolicy)
    .createQueryBuilder()
    .where({ active: true })
    .andWhere(`"start" <= :now AND ("end" IS NULL OR "end" > :now)`, { now })
    .getOne();

  return globalPolicy?.amount || 0;
}

export async function handleReferralKickbackWhenPaid(m: EntityManager, userId: string) {
  const user = await getRepository(User).findOne(userId);
  if (user.everPaid) {
    return;
  }

  user.everPaid = true;
  const entitiesToSave: any[] = [user];
  const { referredBy: referrerUserId } = user;
  if (referrerUserId) {
    const amount = await getCurrentReferralAmountForReferrer(referrerUserId);
    if (amount > 0) {
      const ubt = new UserBalanceTransaction();
      ubt.referredUserId = userId;
      ubt.userId = referrerUserId;
      ubt.amount = amount;
      entitiesToSave.push(ubt);
    }
  }

  await m.save(entitiesToSave);
}