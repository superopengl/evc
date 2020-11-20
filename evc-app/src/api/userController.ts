
import { getRepository, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Portfolio } from '../entity/Portfolio';
import { User } from '../entity/User';
import { UserStatus } from '../types/UserStatus';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { computeUserSecret } from '../utils/computeUserSecret';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { sendEmail } from '../services/emailService';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import { handleInviteUser } from './authController';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';

export const getProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = (req as any).user as User;

  const profileRepo = getRepository(Portfolio);
  const profile = await profileRepo.findOne(id);

  res.json(profile);
});


export const changePassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { password, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const { user } = req as any;
  assert(password && newPassword && user.secret === computeUserSecret(password, user.salt), 400, 'Invalid password');

  const repo = getRepository(User);
  const newSalt = uuidv4();
  const newSecret = computeUserSecret(newPassword, newSalt);
  await repo.update(user.id, { secret: newSecret, salt: newSalt });

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
  const user = await repo.findOne(id);
  assert(user, 404);

  Object.assign(user, req.body);

  const newEmail = email?.trim().toLowerCase();
  const hasEmailChange = newEmail && user.email.toLowerCase() !== newEmail;
  if (hasEmailChange) {
    assert(user.email !== 'system@easyvaluecheck.com', 400, 'Cannot change the email for the builtin admin');
    user.email = newEmail;
    await handleInviteUser(user);
  } else {
    await repo.save(user);
  }

  res.json();
});

export const searchUsers = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const page = +req.body.page;
  const size = +req.body.size;
  const orderBy = req.body.orderBy || 'email';
  const orderDirection = req.body.orderDirection || 'ASC';
  const text = req.body.text?.trim();
  const plans = (req.body.plans || []);

  assert(page >= 0 && size > 0, 400, 'Invalid page and size parameter');

  let query = getRepository(User)
    .createQueryBuilder('u')
    .where(`u.status != :status`, { status: UserStatus.Disabled });

  if (text) {
    query = query.andWhere(`u.email ILIKE :text OR u."givenName" ILIKE :text OR u."surname" ILIKE :text`, { text })
  }
  query = query.leftJoin(q => q.from(Subscription, 's'), 's', `s."userId" = u.id`);
  if (plans.length) {
    const sanitisedPlans = plans.map(p => p === SubscriptionType.Free ? null : p);
    query = query.where(`s.type IN (:...plans)`, { plans: sanitisedPlans });
  }

  query = query.leftJoin(q => q.from(Subscription, 'p'), 'p', 'p."userId" = u.id')
    .orderBy(orderBy, orderDirection)
    .addOrderBy('u.email', 'ASC')
    .offset(page * size)
    .limit(size)
    .select([
      'u.*',
      's.*',
      'u.id as id',
      'u."createdAt" as "createdAt"',
      `COALESCE(p.type, 'free') as "subscriptionType"`
    ]);

  const list = await query.execute();

  res.json(list);
});


export const listAgents = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const list = await getRepository(User)
    .createQueryBuilder()
    .where({ role: 'agent' })
    .select([
      `id`,
      `email`,
      `"givenName"`,
      `surname`,
    ])
    .execute();

  res.json(list);
});

export const deleteUser = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;

  const repo = getRepository(User);
  const user = await repo.findOne({ id, email: Not('system@easyvaluecheck.com') });

  if (user) {
    await getRepository(Portfolio).update({ userId: id }, { deleted: true });
    await getRepository(Task).update({ userId: id }, { status: TaskStatus.ARCHIVE });
    await repo.delete(id);
    await sendEmail({
      to: user.email,
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
