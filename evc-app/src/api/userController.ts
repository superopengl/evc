
import { getRepository, IsNull, Not, getManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { UserStatus } from '../types/UserStatus';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { computeUserSecret } from '../utils/computeUserSecret';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { sendEmail } from '../services/emailService';
import { TaskStatus } from '../types/TaskStatus';
import { handleInviteUser } from './authController';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { attachJwtCookie } from '../utils/jwt';
import { UserProfile } from '../entity/UserProfile';
import { computeEmailHash } from '../utils/computeEmailHash';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { UserBalanceTransaction } from '../entity/UserBalanceTransaction';
import { Payment } from '../entity/Payment';

export const changePassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { password, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const repo = getRepository(User);
  const { user: {id} } = req as any;
  const user = await repo.findOne(id);
  assert(password && newPassword && user.secret === computeUserSecret(password, user.salt), 400, 'Invalid password');

  const newSalt = uuidv4();
  const newSecret = computeUserSecret(newPassword, newSalt);
  user.salt = newSalt;
  user.secret = newSecret;
  await repo.save(user);

  res.json();
});

export const saveProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { id: loginUserId, role } = (req as any).user as User;
  if (role !== 'admin') {
    assert(id === loginUserId, 403);
  }
  const { email } = req.body;
  const repo = getRepository(User);
  const user = await repo.findOne(id, { relations: ['profile'] });
  assert(user, 404);

  Object.assign(user.profile, req.body);

  let hasEmailChange = false;
  if (email) {
    const newEmailHash = computeEmailHash(email);
    hasEmailChange = user.emailHash !== newEmailHash;

    if (hasEmailChange) {
      assert(user.emailHash !== BUILTIN_ADMIN_EMIAL_HASH, 400, 'Cannot change the email for the builtin admin');
      user.emailHash = newEmailHash;
      user.profile.email = email;

      await getManager().save([user.profile, user]);

      await handleInviteUser(user);
    }
  }

  if (!hasEmailChange) {
    await getManager().save(user.profile);
  }

  if (id === loginUserId) {
    attachJwtCookie(user, res);
  }

  res.json();
});

export const searchUsers = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const page = +req.body.page;
  const size = +req.body.size;
  const orderField = req.body.orderBy || 'email';
  const orderDirection = req.body.orderDirection || 'ASC';
  const text = req.body.text?.trim();
  const subscription = (req.body.subscription || []);

  assert(page > 0 && size > 0, 400, 'Invalid page and size parameter');

  let query = getRepository(User)
    .createQueryBuilder('u')
    .innerJoin(UserProfile, 'p', 'u."profileId" = p.id');

  if (text) {
    query = query.andWhere(`(p.email ILIKE :text OR u."givenName" ILIKE :text OR u."surname" ILIKE :text)`, { text: `%${text}%` })
  }
  query = query.leftJoin(q => q.from(Subscription, 's').where(`status = :status`, { status: SubscriptionStatus.Alive }), 's', `s."userId" = u.id`);
  if (subscription.length) {
    query = query.andWhere(`(s.type IN (:...subscription))`, { subscription });
  }

  query = query.orderBy(orderField, orderDirection)
    .addOrderBy('p.email', 'ASC')
    .offset((page - 1) * size)
    .limit(size)
    .select([
      'p.*',
      's.*',
      'u.id as id',
      'u."loginType"',
      'u.role as role',
      'u."lastLoggedInAt"',
      'u."lastNudgedAt"',
      'u."createdAt" as "createdAt"',
      's.type as "subscriptionType"'
    ]);

  const list = await query.execute();

  res.json(list);
});

const BUILTIN_ADMIN_EMIAL_HASH = computeEmailHash('system@easyvaluecheck.com');

export const deleteUser = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;

  const repo = getRepository(User);
  const user = await repo.findOne({
    where: {
      id,
      emailHash: Not(BUILTIN_ADMIN_EMIAL_HASH)
    },
    relations: ['profile']
  });

  if (user) {
    await repo.softDelete(id);
    await sendEmail({
      to: user.profile.email,
      template: 'deleteUser',
      vars: {
        toWhom: getEmailRecipientName(user),
      },
      shouldBcc: false
    });
  }

  res.json();
});

export const setUserPassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { password } = req.body;
  assert(password, 404, 'Invalid password');

  const repo = getRepository(User);
  const newSalt = uuidv4();
  const newSecret = computeUserSecret(password, newSalt);
  await repo.update(id, { secret: newSecret, salt: newSalt });

  res.json();
});

export const listMyBalanceHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { user: { id } } = req as any;
  const list = await getRepository(UserBalanceTransaction)
    .createQueryBuilder('ubt')
    .where(`ubt."userId" = :id`, {id})
    .andWhere(`ubt.amount != 0`)
    .leftJoin(q => q.from(Payment, 'py'), 'py', 'ubt.id = py."balanceTransactionId"')
    .leftJoin(q => q.from(Subscription, 'sub'), 'sub', 'sub.id = py."subscriptionId"')
    .orderBy('ubt."createdAt"', 'DESC')
    .select([
      'ubt."createdAt" as "createdAt"',
      'ubt.amount as amount',
      'py.id as "paymentId"',
      'sub.type as type'
    ])
    .execute();
  res.json(list);
});

export const listUserBalanceHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const list = await getRepository(UserBalanceTransaction)
    .createQueryBuilder('ubt')
    .where('ubt."userId" = :id', { id })
    .leftJoin(q => q.from(User, 'u'), 'u', 'ubt."referredUserId" = u.id')
    .leftJoin(q => q.from(UserProfile, 'p'), 'p', 'p.id = u."profileId"')
    .leftJoin(q => q.from(Payment, 'py'), 'py', 'ubt.id = py."balanceTransactionId"')
    .leftJoin(q => q.from(Subscription, 'sub'), 'sub', 'sub.id = py."subscriptionId"')
    .orderBy('ubt."createdAt"', 'DESC')
    .select([
      'ubt."createdAt" as "createdAt"',
      'ubt.amount as amount',
      'ubt."amountBeforeRollback" as "amountBeforeRollback"',
      'p.email as "referredUserEmail"',
      'py.id as "paymentId"',
      'sub.type as type'
    ])
    .execute();
  res.json(list);
});