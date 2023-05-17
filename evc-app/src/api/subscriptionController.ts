
import { getManager, getRepository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Stock } from '../entity/Stock';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import { StockHistory } from '../entity/StockHistory';
import * as moment from 'moment';
import { StockSearch } from '../entity/StockSearch';
import { logError } from '../utils/logger';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';
import { getCache, setCache } from '../utils/cache';
import { Subscription } from '../entity/Subscription';

export const listSubscriptionHistory = handlerWrapper(async (req, res) => {
  assert(false, 501);

});

export const getCurrentSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  assert(false, 501);
  const { user: { id: userId } } = req as any;
  const { symbol } = req.params;

  const repo = getRepository(Subscription);
  const subscription = await repo.findOne({
    where: {
      userId
    },
    order: {
      createdAt: 'DESC'
    }
  });

  res.json(subscription);
});

export const changeSubscription = handlerWrapper(async (req, res) => {
  assert(false, 501);

});
