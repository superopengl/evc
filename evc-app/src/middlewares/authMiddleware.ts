
import { getRepository, LessThan, MoreThan, Not } from 'typeorm';
import { User } from '../entity/User';
import { getUtcNow } from '../utils/getUtcNow';
import { verifyJwtFromCookie, attachJwtCookie, clearJwtCookie } from '../utils/jwt';
import * as moment from 'moment';
import { UserStatus } from '../types/UserStatus';
import { Subscription } from '../entity/Subscription';
import { getUserSubscription } from '../utils/getUserSubscription';

async function attachSubscriptionCredential(user) {
  const subscription = await getUserSubscription(user.id);

  user.subscribedSymbols = subscription ? subscription.symbols : null;
}

export const authMiddleware = async (req, res, next) => {
  try {
    let user = verifyJwtFromCookie(req);

    if (user) {
      // Logged in users
      const { id, expires } = user;
      const repo = getRepository(User);
      if (moment(expires).isBefore()) {
        // JWT token expired. Needs to refresh
        const existingUser = await getActive;
        if (!existingUser) {
          // User not existing anymore
          clearJwtCookie(res);
          res.sendStatus(401);
          return;
        }
        user = existingUser;
        await attachSubscriptionCredential(user);
      }
      repo.update({id}, { lastNudgedAt: getUtcNow() }).catch(() => { });
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

