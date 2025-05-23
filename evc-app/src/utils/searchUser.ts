import { getRepository } from 'typeorm';
import { assert } from './assert';
import { User } from '../entity/User';
import { UserProfile } from '../entity/UserProfile';
import { UserAliveSubscriptionSummary } from '../entity/views/UserAliveSubscriptionSummary';

export type StockUserParams = {
  text?: string;
  page: number;
  size: number;
  orderField: string;
  orderDirection: 'ASC' | 'DESC';
  subscription: string[];
  tags: string[];
};

export async function searchUser(queryInfo: StockUserParams) {
  const { text, page, size, orderField, orderDirection, tags, subscription } = queryInfo;

  const pageNo = page || 1;
  const pageSize = size || 50;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getRepository(User)
    .createQueryBuilder('u')
    .innerJoin(UserProfile, 'p', 'u."profileId" = p.id')
    .where('1 = 1');

  if (text) {
    query = query.andWhere('(p.email ILIKE :text OR p."givenName" ILIKE :text OR p."surname" ILIKE :text)', { text: `%${text}%` });
  }
  query = query.leftJoin(q => q.from(UserAliveSubscriptionSummary, 's'), 's', 's."userId" = u.id');
  if (subscription?.length) {
    query = query.andWhere('(COALESCE(s."currentType", \'free\') IN (:...subscription))', { subscription });
  }
  query = query.leftJoin(q => q
    .from('user_tags_user_tag', 'tg')
    .groupBy('tg."userId"')
    .select([
      'tg."userId" as "userId"',
      'array_agg(tg."userTagId") as tags'
    ]),
  'tg', 'tg."userId" = u.id');

  if (tags?.length) {
    query = query.andWhere('(tg.tags && array[:...tags]::uuid[]) IS TRUE', { tags });
  }

  const count = await query.getCount();

  query = query.orderBy(`"${orderField}"`, orderDirection)
    // .addOrderBy('p.email', 'ASC')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize)
    .select([
      'p.*',
      'p.geo ->> \'country\' as "ipCountry"',
      'u.id as id',
      'u."loginType"',
      'u.role as role',
      'COALESCE(s."currentType", \'free\') as subscription',
      'tg.tags as tags',
      'COALESCE(u."lastNudgedAt", u."lastLoggedInAt") as "lastNudgedAt"',
      'u."createdAt" as "createdAt"',
    ]);

  const data = await query.execute();

  return {
    count,
    page: pageNo,
    data
  };
}
