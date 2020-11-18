
import { getRepository } from 'typeorm';
import { Blog } from '../entity/Blog';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { redisCache } from '../services/redisCache';

export const getDebugInfo = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const info = {
    concurrentUserNumber: res.app.locals.server.connections
  };

  res.json(info);
});