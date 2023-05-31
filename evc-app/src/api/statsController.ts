
import { getRepository } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assertRole } from '../utils/assert';
import { User } from '../entity/User';

async function getUserStats() {
  const result = await getRepository(User)
    .createQueryBuilder('x')
    .select('x.role as name')
    .addSelect(`COUNT(1) AS count`)
    .groupBy('x.role')
    .execute();

  return result.reduce((pre, cur) => {
    pre[cur.name] = +cur.count;
    return pre;
  }, {
    admin: 0,
    agent: 0,
    client: 0,
  });
}

export const getAdminStats = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const stats = {
    user: await getUserStats(),
  };

  res.json(stats);
});
