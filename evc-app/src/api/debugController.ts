
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';

export const getDebugInfo = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const info = {
    concurrentUserNumber: res.app.locals.server.connections
  };

  res.json(info);
});