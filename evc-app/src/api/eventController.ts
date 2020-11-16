
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
import { Subject } from 'rxjs';
import { EventService } from '../services/eventService';

const isProd = process.env.NODE_ENV === 'prod';
const eventService = new EventService('price');

export const subscribeEvent = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { id: userId } } = req as any;
  if (!isProd) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:6007');
  }
  const sse = res.sse();
  // res.setHeader('Content-Type', 'text/event-stream');
  // res.setHeader('Cache-Control', 'no-cache');
  // res.flushHeaders();

  // res.writeHead(200, {
  //   // Connection: 'keep-alive',
  //   // 'Content-Type': 'text/event-stream',
  //   // 'Cache-Control': 'no-cache',
  //   'Access-Control-Allow-Origin': 'http://localhost:6007'
  // });
  // res.flushHeaders();

  const channel$ = eventService.subscribe(data => {
    res.write(`data: ${data}\n\n`);
    (res as any).flush();
  });

  res.on('close', () => {
    channel$.unsubscribe();
    res.end();
  });
});

export const publishEvent = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const event = req.body;

  eventService.publish(event);

  res.json();
});