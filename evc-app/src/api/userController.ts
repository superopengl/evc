
import { getRepository, Not, getManager, In } from 'typeorm';
import { User } from '../entity/User';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { computeUserSecret } from '../utils/computeUserSecret';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { enqueueEmail } from '../services/emailService';
import { handleInviteUser } from './authController';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { Subscription } from '../entity/Subscription';
import { attachJwtCookie } from '../utils/jwt';
import { UserProfile } from '../entity/UserProfile';
import { computeEmailHash } from '../utils/computeEmailHash';
import { UserCreditTransaction } from '../entity/UserCreditTransaction';
import { Payment } from '../entity/Payment';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { searchUser } from '../utils/searchUser';
import { UserTag } from '../entity/UserTag';
import { GuestUserStats } from '../entity/GuestUserStats';
import { Role } from '../types/Role';
import { getTableName } from '../utils/getTableName';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';

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
  const orderField = req.body.orderField || 'createdAt';
  const orderDirection = req.body.orderDirection || 'DESC';
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
    await getManager().transaction(async m => {
      await m.getRepository(UserProfile).delete(profileId);
      await m.getRepository(User).softDelete(id);
    })

    await enqueueEmail({
      to: user.profile.email,
      template: EmailTemplateType.DeleteUser,
      vars: {
        toWhom: getEmailRecipientName(user.profile),
        email: user.profile.email,
      },
      shouldBcc: true
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

export const listMyCreditHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'member', 'free');
  const { user: { id } } = req as any;
  const list = await getRepository(UserCreditTransaction)
    .createQueryBuilder('uc')
    .where('uc."userId" = :id', { id })
    // .andWhere('uc.amount != 0')
    .leftJoin(q => q.from(Payment, 'py'), 'py', 'uc.id = py."creditTransactionId"')
    .leftJoin(q => q.from(Subscription, 'sub'), 'sub', 'sub.id = py."subscriptionId"')
    .orderBy('uc."createdAt"', 'DESC')
    .select([
      'uc."createdAt" as "createdAt"',
      'uc.amount as amount',
      'py.id as "paymentId"',
      'sub.type as type'
    ])
    .execute();
  res.json(list);
});

export const listUserCreditHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const list = await getRepository(UserCreditTransaction)
    .createQueryBuilder('uc')
    .where('uc."userId" = :id', { id })
    .leftJoin(q => q.from(User, 'u'), 'u', 'uc."referredUserId" = u.id')
    .leftJoin(q => q.from(UserProfile, 'p'), 'p', 'p.id = u."profileId"')
    .leftJoin(q => q.from(Payment, 'py'), 'py', 'uc.id = py."creditTransactionId"')
    .leftJoin(q => q.from(Subscription, 'sub'), 'sub', 'sub.id = py."subscriptionId"')
    .orderBy('uc."createdAt"', 'DESC')
    .select([
      'uc."createdAt" as "createdAt"',
      'uc.amount as amount',
      'uc."revertedCreditTransactionId" as "revertedCreditTransactionId"',
      'uc.type as "creditType"',
      'p.email as "referredUserEmail"',
      'py.id as "paymentId"',
      'sub.type as type'
    ])
    .execute();
  res.json(list);
});

export const getUserGuestSignUpChart = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { start, end, interval } = req.query;
  const format = {
    'minute': 'YYYY/MM/DD HH24:MI',
    'hour': 'YYYY/MM/DD HH24',
    'day': 'YYYY/MM/DD',
    'month': 'YYYY/MM'
  }[interval as string];
  assert(format, 400, `Unsupported interval parameter '${interval}'`);

  const guests = await getManager()
    .createQueryBuilder()
    .from(q => q
      .from(GuestUserStats, 'u')
      .andWhere(start ? `:start <= "createdAt"` : `1=1`, { start })
      .andWhere(end ? `"lastNudgedAt" <= :end` : `1=1`, { end })
      .select(`TO_CHAR("lastNudgedAt", '${format}') as time`)
      , 'x')
    .groupBy('time')
    .select([
      'time',
      'COUNT(1) as count',
    ])
    .execute();

  const newSignUps = await getManager()
    .createQueryBuilder()
    .from(q => q
      .from(User, 'u')
      .where(`role != '${Role.Admin}'`)
      .andWhere(start ? `:start <= "createdAt"` : `1=1`, { start })
      .andWhere(end ? `"createdAt" <= :end` : `1=1`, { end })
      .select(`TO_CHAR("createdAt", '${format}') as time`)
      , 'x')
    .groupBy('time')
    .select([
      'time',
      'COUNT(1) as count',
    ])
    .execute();

  const result = {
    guests,
    signUps: newSignUps,
  }

  res.json(result);
});

export const guestUserPing = handlerWrapper((req, res) => {
  const { deviceId } = req.body;
  if (validateUuid(deviceId)) {
    getManager()
      .createQueryBuilder()
      .insert()
      .into(GuestUserStats)
      .values({
        deviceId
      })
      .onConflict(`("deviceId") DO UPDATE SET count = ${getTableName(GuestUserStats)}.count + 1, "lastNudgedAt" = NOW()`)
      .execute()
      .catch(() => {});
  }

  res.json();
});