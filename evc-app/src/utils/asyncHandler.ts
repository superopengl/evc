import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * @types/express 5 widens `req.params` values to `string | string[]`, because path-to-regexp 8
 * lets a wildcard (`/*splat`) capture an array of path segments. Every route bound from
 * api.yml uses plain `:name` params, which are always a single string at runtime, so bind the
 * params type once here instead of casting at ~45 call sites in the controllers.
 */
type RouteParams = Record<string, string>;

export function handlerWrapper<ResBody = any, ReqBody = any, ReqQuery = any>(
  handler: (
    req: Request<RouteParams, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => void | Promise<void>,
): RequestHandler<RouteParams, ResBody, ReqBody, ReqQuery> {
  return expressAsyncHandler<RouteParams, ResBody, ReqBody, ReqQuery>(handler);
}
