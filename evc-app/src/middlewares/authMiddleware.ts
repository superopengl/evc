
import { verifyJwtFromCookie, attachJwtCookie, clearJwtCookie } from '../utils/jwt';
import * as moment from 'moment';
import { getActiveUserByEmail } from '../utils/getActiveUserByEmail';
import { getRepository, getManager } from 'typeorm';
import { User } from '../entity/User';
import { getUtcNow } from '../utils/getUtcNow';
import 'colors';
import { GuestUserStats } from '../entity/GuestUserStats';
import { getTableName } from '../utils/getTableName';

export const authMiddleware = async (req, res, next) => {
  // console.log('Authing'.green, req.method, req.url);

  try {
    let user = verifyJwtFromCookie(req);

    if (user) {
      // Logged in users
      const { expires } = user;
      if (moment(expires).isBefore()) {
        // JWT token expired. Needs to refresh
        const existingUser = await getActiveUserByEmail(user.profile.email);
        if (!existingUser) {
          // User not existing anymore
          clearJwtCookie(res);
          res.sendStatus(401);
          return;
        }
        // console.log('Renewed cookie for'.green, user.profile.email);

        user = existingUser;
      }
      getRepository(User).update({ id: user.id }, { lastNudgedAt: getUtcNow() }).catch(() => { });
      req.user = Object.freeze(user);
      attachJwtCookie(user, res);
    } else {
      // Guest user (hasn't logged in)
      // req.user = null;
      // clearJwtCookie(res);
    }
  } catch {
    clearJwtCookie(res);
  }

  // console.log('Auth done'.green, req.method, req.url, req.user);

  next();
};

