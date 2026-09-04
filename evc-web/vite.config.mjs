import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// CRA resolved bare specifiers like `services/stockService` against src (jsconfig baseUrl).
// Vite needs those spelled out.
const SRC_DIRS = ['components', 'contexts', 'def', 'fonts', 'pages', 'services', 'translations', 'util'];

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
        { find: /^tslib$/, replacement: path.resolve(__dirname, 'node_modules/tslib') },
        // `import('AppLoggedIn')` and friends: bare specifiers naming a file at the root of src.
        { find: /^(App|AppLoggedIn|antdTheme|serviceWorker)$/, replacement: path.resolve(__dirname, 'src') + '/$1' },
        ...SRC_DIRS.map(d => ({
          find: new RegExp(`^${d}/`),
          replacement: path.resolve(__dirname, `src/${d}/`) + '/',
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
    server: {
      port: 6007,
    },
    build: {
      // the Dockerfile copies evc-web/build into evc-app/www
      outDir: 'build',
      sourcemap: process.env.GENERATE_SOURCEMAP === 'true',
    },
  };
});
