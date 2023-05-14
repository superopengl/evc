import { User } from '../entity/User';
import { UserLogin } from '../entity/UserLogin';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';
import { getRepository } from 'typeorm';

export async function logUserLogin(req, loginType: 'local' | 'google') {
  const user = (req as any).user as User;
  const entity = new UserLogin();

  entity.userId = user.id;
  entity.loginMethod = loginType;
  entity.ipAddress = req.ip;
  entity.location = geoip.lookup(req.ip);
  entity.userAgent = uaParser(req.headers['user-agent']);

  await getRepository(UserLogin).insert(entity);
}