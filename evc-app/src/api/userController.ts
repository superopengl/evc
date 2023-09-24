
import { getRepository, Not, getManager, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { computeUserSecret } from '../utils/computeUserSecret';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { sendEmail } from '../services/emailService';
import { handleInviteUser } from './authController';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { Subscription } from '../entity/Subscription';
import { attachJwtCookie } from '../utils/jwt';
import { UserProfile } from '../entity/UserProfile';
import { computeEmailHash } from '../utils/computeEmailHash';
import { UserBalanceTransaction } from '../entity/UserBalanceTransaction';
import { Payment } from '../entity/Payment';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { searchUser } from '../utils/searchUser';
import { UserTag } from '../entity/UserTag';
import { existsQuery } from '../utils/existsQuery';

export const changePassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member');
  const { password, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const repo = getRepository(User);
  const { user: { id } } = req as any;
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
  assertRole(req, 'admin', 'agent', 'member', 'free');
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

      await handleInviteUser(user, user.profile);
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

export const searchUserList = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const page = +req.body.page;
  const size = +req.body.size;
  const orderField = req.body.orderBy || 'email';
  const orderDirection = req.body.orderDirection || 'ASC';
  const text = req.body.text?.trim();
  const subscription = (req.body.subscription || []);
  const tags = (req.body.tags || []);

  const list = await searchUser({
    text,
    page,
    size,
    orderField,
    orderDirection,
    subscription,
    tags
  });

  res.json(list);
});

const BUILTIN_ADMIN_EMIAL_HASH = computeEmailHash('system@easyvaluecheck.com');

export const listAllUsers = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const list = await getRepository(UserProfile)
    .createQueryBuilder('p')
    .innerJoin(User, 'u', `u."profileId" = p.id AND u."deletedAt" IS NULL`)
    .select([
      'u.id as id',
      '"givenName"',
      'surname',
      'email'
    ])
    .execute();

  res.json(list);
});

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
    const { profileId } = user;
    await repo.softDelete(id);
    await getRepository(UserProfile).delete(profileId);

    await sendEmail({
      to: user.profile.email,
      template: EmailTemplateType.DeleteUser,
      vars: {
        toWhom: getEmailRecipientName(user),
        email: user.profile.email,
      },
      shouldBcc: false
    });
  }

  res.json();
});

export const setUserTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;

  const { tags } = req.body;
  const repo = getRepository(User);
  const user = await repo.findOne(id);
  if (tags?.length) {
    user.tags = await getRepository(UserTag).find({
      where: {
        id: In(tags)
      }
    });
  } else {
    user.tags = [];
  }
  await repo.save(user);
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
  assertRole(req, 'member', 'free');
  const { user: { id } } = req as any;
  const list = await getRepository(UserBalanceTransaction)
    .createQueryBuilder('ubt')
    .where('ubt."userId" = :id', { id })
    .andWhere('ubt.amount != 0')
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