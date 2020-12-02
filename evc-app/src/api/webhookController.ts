
import { getManager, getRepository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Stock } from '../entity/Stock';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import * as moment from 'moment';
import { StockSearch } from '../entity/StockSearch';
import { logError } from '../utils/logger';
import * as geoip from 'geoip-lite';
import * as uaParser from 'ua-parser-js';
import { getCache, setCache } from '../utils/cache';
import { Subscription } from '../entity/Subscription';
import { Subject } from 'rxjs';
import { RedisRealtimePricePubService, RedisRealtimePriceSubService, RedisSubService } from '../services/RedisPubSubService';
import { redisCache } from '../services/redisCache';
import { getStripe, parseStripeWebhookEvent } from '../services/stripeService';

const isProd = process.env.NODE_ENV === 'prod';
const subscriber = new RedisRealtimePriceSubService();
const publisher = new RedisRealtimePricePubService();

export const webhookStripe = async (req, res) => {
  const event = await parseStripeWebhookEvent(req);

  switch(event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      break;
    default:
  }

  res.json({received: true});
};
