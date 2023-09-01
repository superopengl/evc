
import { verifyJwtFromCookie, attachJwtCookie, clearJwtCookie } from '../utils/jwt';
import * as moment from 'moment';
import { getActiveUserByEmail } from '../utils/getActiveUserByEmail';

export const authMiddleware = async (req, res, next) => {
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
        user = existingUser;
      }
      // repo.update({id}, { lastNudgedAt: getUtcNow() }).catch(() => { });
      req.user = Object.freeze(user);
      attachJwtCookie(user, res);
    } else {
      // Guest user (hasn't logged in)
    }
  } catch {
    clearJwtCookie(res);
  }

  next();
};

