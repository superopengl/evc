import { Application } from 'express';

export type AppEndpoint = { path: string; methods: string[] };

/**
 * express-list-endpoints reads `app._router`, which Express 5 renamed to `app.router`, so it
 * silently returns [] instead of failing. Its last release (Nov 2024) predates Express 5 and
 * it has no Express 5 support, so we walk the router stack ourselves.
 *
 * This only covers routes registered directly on the app, which is all we have: the api.yml
 * connector and app.ts both bind onto the app rather than mounting sub-routers.
 */
export function listAppEndpoints(app: Application): AppEndpoint[] {
  const stack = (app as any).router?.stack ?? [];
  const methodsByPath = new Map<string, Set<string>>();

  for (const layer of stack) {
    if (!layer.route) {
      continue;
    }
    const { path, methods } = layer.route;
    if (!methodsByPath.has(path)) {
      methodsByPath.set(path, new Set());
    }
    Object.keys(methods ?? {})
      .filter(method => methods[method])
      .forEach(method => methodsByPath.get(path).add(method.toUpperCase()));
  }

  return [...methodsByPath].map(([path, methods]) => ({ path, methods: [...methods].sort() }));
}
