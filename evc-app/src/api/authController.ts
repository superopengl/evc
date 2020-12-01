
import { getRepository, getConnection, Not, getManager } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../types/UserStatus';
import { computeUserSecret } from '../utils/computeUserSecret';
import { handlerWrapper } from '../utils/asyncHandler';
import { sendEmail } from '../services/emailService';
import { getUtcNow } from '../utils/getUtcNow';
import { Role } from '../types/Role';
import * as jwt from 'jsonwebtoken';
import { attachJwtCookie, clearJwtCookie } from '../utils/jwt';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { logUserLogin } from '../utils/loginLog';
import { sanitizeUser } from '../utils/sanitizeUser';
import { createReferral } from './accountController';
import { createInitialFreeSubscription } from './subscriptionController';
import { computeEmailHash } from '../utils/computeEmailHash';
import { getActiveUserByEmail } from '../utils/getActiveUserByEmail';
import { UserProfile } from '../entity/UserProfile';
import { ReferralCode } from '../entity/ReferralCode';

export const getAuthUser = handlerWrapper(async (req, res) => {
  const { user } = (req as any);
  res.json(user || null);
});

export const login = handlerWrapper(async (req, res) => {
  const { name, password } = req.body;

  const user = await getActiveUserByEmail(name);

  assert(user, 400, 'User or password is not valid');

  // Validate passpord
  const hash = computeUserSecret(password, user.salt);
  assert(hash === user.secret, 400, 'User or password is not valid');

  user.lastLoggedInAt = getUtcNow();
  user.resetPasswordToken = null;
  user.status = UserStatus.Enabled;

  await getRepository(User).save(user);

  attachJwtCookie(user, res);

  logUserLogin(user, req, 'local');

  res.json(sanitizeUser(user));
});

export const logout = handlerWrapper(async (req, res) => {
  clearJwtCookie(res);
  res.json();
});


function createUserAndProfileEntity(payload): { user: User, profile: UserProfile } {
  const { email, password, role, referralCode, ...other } = payload;
  const thePassword = password || uuidv4();
  validatePasswordStrength(thePassword);
  assert([Role.Client, Role.Agent].includes(role), 400, `Unsupported role ${role}`);

  const profileId = uuidv4();
  const userId = uuidv4();
  const salt = uuidv4();

  const profile = new UserProfile();
  profile.id = profileId;
  profile.email = email.trim().toLowerCase();
  Object.assign(profile, other);

  const user = new User();
  user.id = userId;
  user.emailHash = computeEmailHash(email);
  user.secret = computeUserSecret(thePassword, salt);
  user.salt = salt;
  user.role = role;
  user.status = UserStatus.Enabled;
  user.profileId = profileId;
  user.referredBy = referralCode;

  return { user, profile };
}

async function createNewLocalUser(payload): Promise<{ user: User, profile: UserProfile }> {
  const { user, profile } = createUserAndProfileEntity(payload);

  user.resetPasswordToken = uuidv4();
  user.status = UserStatus.ResetPassword;

  await getManager().save([profile, user]);

  await createReferral(user.id);

  await createInitialFreeSubscription(user.id);

  return { user, profile };
}


export const signup = handlerWrapper(async (req, res) => {
  const payload = req.body;

  const { user, profile } = await createNewLocalUser({
    password: uuidv4(), // Temp password to fool the functions beneath
    ...payload,
    role: 'client'
  });

  const { id, resetPasswordToken } = user;
  const { email } = profile;

  const url = `${process.env.EVC_API_DOMAIN_NAME}/r/${resetPasswordToken}/`;
  // Non-blocking sending email
  sendEmail({
    template: 'welcome',
    to: email,
    vars: {
      email,
      url
    },
    shouldBcc: true
  }, true).catch(() => {});

  const info = {
    id,
    email
  };

  res.json(info);
});

async function setUserToResetPasswordStatus(user: User) {
  const userRepo = getRepository(User);
  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  const url = `${process.env.EVC_API_DOMAIN_NAME}/r/${resetPasswordToken}/`;
  await sendEmail({
    to: user.profile.email,
    template: 'resetPassword',
    vars: {
      toWhom: getEmailRecipientName(user),
      url
    },
    shouldBcc: false
  });

  await userRepo.save(user);
}

export const forgotPassword = handlerWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await getActiveUserByEmail(email);
  if (!user) {
    res.json();
    return;
  }

  await setUserToResetPasswordStatus(user);

  res.json();
});

export const resetPassword = handlerWrapper(async (req, res) => {
  const { token, password } = req.body;
  validatePasswordStrength(password);

  const salt = uuidv4();
  const secret = computeUserSecret(password, salt);

  await getConnection()
    .createQueryBuilder()
    .update(User)
    .set({
      secret,
      salt,
      resetPasswordToken: null,
      status: UserStatus.Enabled
    })
    .where({
      resetPasswordToken: token,
      status: UserStatus.ResetPassword
    })
    .execute();

  res.json();
});

export const retrievePassword = handlerWrapper(async (req, res) => {
  const { token } = req.params;
  assert(token, 400, 'Invalid token');

  const userRepo = getRepository(User);
  const user = await userRepo.findOne({ resetPasswordToken: token });

  assert(user, 401, 'Token expired');

  const url = `${process.env.EVC_API_DOMAIN_NAME}/reset_password?token=${token}`;
  res.redirect(url);
});

export const impersonate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { email } = req.body;
  assert(email, 400, 'Invalid email');

  const user = await getActiveUserByEmail(email);

  assert(user, 404, 'User not found');

  attachJwtCookie(user, res);

  res.json(sanitizeUser(user));
});

export const handleInviteUser = async (user) => {
  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  const url = `${process.env.EVC_API_DOMAIN_NAME}/r/${resetPasswordToken}/`;
  const email = user.profile.email;
  await sendEmail({
    to: email,
    template: 'inviteUser',
    vars: {
      toWhom: getEmailRecipientName(user),
      email,
      url
    },
    shouldBcc: false
  });

  await getRepository(User).save(user);
}

export const inviteUser = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { email, role } = req.body;

  const existingUser = await getActiveUserByEmail(email);
  assert(!existingUser, 400, 'User exists');

  const user = createUserAndProfileEntity({
    email,
    role: role || 'client'
  });

  await handleInviteUser(user);

  res.json();
});

async function decodeEmailFromGoogleToken(token) {
  assert(token, 400, 'Empty code payload');
  const secret = process.env.EVC_GOOGLE_SSO_CLIENT_SECRET;
  const decoded = jwt.decode(token, secret);
  const { email, given_name: givenName, family_name: surname } = decoded;
  assert(email, 400, 'Invalid Google token');
  return { email, givenName, surname };
}

export const ssoGoogle = handlerWrapper(async (req, res) => {
  const { token, referralCode } = req.body;

  const { email, givenName, surname } = await decodeEmailFromGoogleToken(token);

  let user = await getActiveUserByEmail(email);

  const isNewUser = !user;
  const now = getUtcNow();
  const extra = {
    loginType: 'google',
    lastLoggedInAt: now,
    lastNudgedAt: now,
    referredBy: referralCode,
  };

  if (isNewUser) {
    const { user: newUser, profile } = createUserAndProfileEntity({
      email,
      role: 'client'
    });

    user = Object.assign(newUser, extra);
    user.profile = profile;
    profile.givenName = givenName;
    profile.surname = surname;
    await getManager().save([user, profile]);

    await createReferral(user.id);
    await createInitialFreeSubscription(user.id);
  } else {
    user = Object.assign(user, extra);
    await getRepository(User).save(user);
  }

  attachJwtCookie(user, res);

  logUserLogin(user, req, 'google');

  res.json(sanitizeUser(user));
});