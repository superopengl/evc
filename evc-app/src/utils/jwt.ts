
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { assert } from './assert';
import { sanitizeUser } from './sanitizeUser';

const cookieName = 'jwt';
const isProd = process.env.NODE_ENV === 'prod';
const refreshUserIntervalSecond = isProd ? 60 * 30 : 30; // 30 mins on prod, 30 seconds on dev
const cookieMaxAgeSeconds = isProd ? 60 * 60 * 24 : 60 * 60 * 24 * 365; // 1 day on prod, or 1 year on dev

export const COOKIE_OPTIONS = {
  httpOnly: true,
  signed: false,
  sameSite: isProd ? 'strict' : undefined,
  secure: isProd ? true : undefined,
};

export function attachJwtCookie(user, res) {
  assert(user.id, 500, 'User has no id');
  const payload = sanitizeUser(user);
  payload.expires = moment().utc().add(refreshUserIntervalSecond, 'seconds').toDate();

  const token = jwt.sign(payload, JwtSecret);

  res.cookie(cookieName, token, {
    ...COOKIE_OPTIONS,
    maxAge: 1000 * cookieMaxAgeSeconds,
    expires: moment().utc().add(cookieMaxAgeSeconds, 'seconds').toDate()
  });
}

export const JwtSecret = 'easyvaluecheck.com';

export function verifyJwtFromCookie(req) {
  const token = req.cookies[cookieName];
  let user = null;
  if (token) {
    user = jwt.verify(token, JwtSecret);
    // const { expires } = user;
    // assert(moment(expires).isAfter(), 401, 'Token expired');
  }

  return user;
}

export function clearJwtCookie(res) {
  res.clearCookie(cookieName, COOKIE_OPTIONS);
}