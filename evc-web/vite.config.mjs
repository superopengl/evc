import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Where `pnpm bs` puts the API. Read out of evc-app/.env so the dev proxy below cannot drift
// from the port the backend actually binds; EVC_API_PROXY_PORT overrides for one-off setups.
function resolveApiPort() {
  if (process.env.EVC_API_PROXY_PORT) return process.env.EVC_API_PROXY_PORT;
  try {
    const appEnv = fs.readFileSync(path.resolve(import.meta.dirname, '../evc-app/.env'), 'utf8');
    const match = appEnv.match(/^\s*EVC_HTTP_PORT\s*=\s*(\d+)/m);
    if (match) return match[1];
  } catch {
    // evc-app/.env is gitignored and may not exist yet; fall through to the default.
  }
  return '6008';
}

// One origin for the whole app in dev, the same as production: the SPA and the API are both
// http://localhost:6007. The API still listens on its own port, but the browser never talks to
// it directly, so REACT_APP_EVC_API_ENDPOINT stays the relative `/api/v1` the Dockerfile bakes
// in, and there is no cross-origin cookie/CORS story to maintain locally.
const API_PROXY = Object.fromEntries(
  // `/api` covers the SSE stream at /api/v1/event as well - http-proxy pipes it through
  // unbuffered. `/r/:token` is a backend redirect (the password-reset links built from
  // EVC_API_DOMAIN_NAME), not a client-side route, so without it the SPA fallback swallows it.
  ['/api', '/r/', '/healthcheck'].map(prefix => [prefix, {
    target: `http://localhost:${resolveApiPort()}`,
    // Leave the Host header as localhost:6007 so the API's cookies stay on the origin the
    // browser actually loaded.
    changeOrigin: false,
  }]),
);

// CRA resolved bare specifiers like `services/stockService` against src (jsconfig baseUrl).
// Vite needs those spelled out.
const SRC_DIRS = ['components', 'contexts', 'def', 'fonts', 'hooks', 'pages', 'services', 'translations', 'util'];

export default defineConfig(({ mode }) => {
  // Keep the REACT_APP_* contract rather than renaming everything to VITE_*: the Dockerfile
  // bakes those names in as build ARGs/ENV and devops/.env.prod uses them too.
  const fileEnv = loadEnv(mode, process.cwd(), ['REACT_APP_', 'NODE_ENV', 'PUBLIC_URL']);
  const merged = { ...fileEnv };
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('REACT_APP_')) merged[k] = v;
  }
  merged.NODE_ENV = mode === 'production' ? 'production' : 'development';
  merged.PUBLIC_URL = '';

  return {
    plugins: [
      // Every component here is a .js file containing JSX, which Rolldown will not parse as
      // JSX on its own (Vite's `oxc` option omits `lang`). Handing those files to the React
      // plugin is what makes them parse. Note this takes a RegExp, not a glob.
      react({ include: /\.(js|jsx)$/ }),
    ],
    resolve: {
      alias: [
        { find: /^tslib$/, replacement: path.resolve(import.meta.dirname, 'node_modules/tslib') },
        // `import('AppLoggedIn')` and friends: bare specifiers naming a file at the root of src.
        { find: /^(App|AppLoggedIn|antdTheme|designTokens|serviceWorker)$/, replacement: path.resolve(import.meta.dirname, 'src') + '/$1' },
        ...SRC_DIRS.map(d => ({
          find: new RegExp(`^${d}/`),
          replacement: path.resolve(import.meta.dirname, `src/${d}/`) + '/',
        })),
      ],
    },
    // Replacing the whole object keeps `console.log(process.env)` and any unknown
    // process.env.X lookup working instead of blowing up on an undefined `process`.
    define: {
      'process.env': JSON.stringify(merged),
    },
    css: {
      preprocessorOptions: {
        less: { javascriptEnabled: true },
      },
    },
    // strictPort matters now that the API is same-origin: without it Vite would quietly take the
    // next free port when 6007 is busy - typically 6008, the API's own - and the relative
    // /api/v1 would then proxy the app to itself. Fail loudly instead.
    server: { port: 6007, strictPort: true, proxy: API_PROXY },
    // The built SPA carries the same relative /api/v1, so `pnpm preview` needs the proxy too.
    preview: { port: 6007, strictPort: true, proxy: API_PROXY },
    build: {
      // the Dockerfile copies evc-web/build into evc-app/www
      outDir: 'build',
      sourcemap: process.env.GENERATE_SOURCEMAP === 'true',
    },
  };
});
