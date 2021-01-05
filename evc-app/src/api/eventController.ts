
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { RedisRealtimePricePubService, RedisRealtimePriceSubService } from '../services/RedisPubSubService';

const isProd = process.env.NODE_ENV === 'prod';
const subscriber = new RedisRealtimePriceSubService();
const publisher = new RedisRealtimePricePubService();

export const subscribeEvent = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  // const { user: { id: userId } } = req as any;
  if (!isProd) {
    res.setHeader('Access-Control-Allow-Origin', process.env.EVC_WEB_DOMAIN_NAME);
  }
  res.sse();
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

  const channel$ = subscriber.subscribe(data => {
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

  publisher.publish(event);

  res.json();
});