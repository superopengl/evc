# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

EasyValueCheck (evc) — a stock fair-value analysis SaaS (easyvaluecheck.com). Three sub-projects in one repo, each with its own `package.json` and its own `pnpm-lock.yaml` (there is **no** pnpm workspace; install deps inside each folder):

- `evc-app/` — TypeScript Express API + TypeORM/PostgreSQL + Redis. Also serves the built frontend as static files.
- `evc-web/` — JavaScript React 17 SPA (CRA via craco, antd 4).
- `evc-chrome-ext/` — small unbundled Chrome extension (plain JS/manifest, no build step).

Package manager is pinned to `pnpm@10.7.1` everywhere.

## Common commands

From the repo root:

```bash
pnpm bs          # backend: cd evc-app && pnpm dev  (nodemon + ts-node, watches src)
pnpm fs          # frontend: cd evc-web && pnpm start (craco dev server on :6007)
pnpm release     # docker build → push to ECR → force ECS redeploy (portal+daemon) → CloudFront invalidation
```

`evc-app`:

```bash
pnpm start           # ts-node index.ts (TZ=utc)
pnpm daemon          # long-running daemon process (email sender / price SSE)
pnpm lint            # eslint --fix over .ts
pnpm build           # lint + clean + tsc
pnpm test            # jest (ts-jest preset; note: no test files exist yet)
pnpm test -- -t "name"   # single test by name
pnpm link-web        # symlink evc-app/www → evc-web/build so the API serves the SPA locally
pnpm sync:schema     # drop+recreate views, synchronize schema, run migrations, seed config
pnpm migrate:up / migrate:down / migrate:new -- <Name>
pnpm feed:eps        # one-off data jobs; see "Batch jobs" below
```

`evc-web`:

```bash
pnpm start     # dev server, PORT=6007
pnpm build     # dev-flavored build (sourcemaps on)
pnpm compile   # production build (CLIENT_ENV=production, no sourcemaps)
pnpm test      # craco test
pnpm g -- Name # scaffold a component into src/components (generate-react-cli)
pnpm p -- Name # scaffold a page into src/pages
```

The frontend scripts used to carry `NODE_OPTIONS=--openssl-legacy-provider --no-experimental-fetch` for react-scripts 5. Both flags were dropped when the runtime moved to Node 24: `--no-experimental-fetch` no longer exists there (the process exits with code 9 before webpack starts), and `--openssl-legacy-provider` is no longer needed for the webpack 5 build. Don't reintroduce them.

Local config lives in gitignored `.env` files: `evc-app/.env` (TypeORM `TYPEORM_*` vars, AWS, Redis, Stripe/PayPal, AlphaVantage, Google SSO) and `evc-web/.env` (`REACT_APP_*`). `evc-app/src/index.ts` hard-fails at boot if required env vars are missing, and in non-prod also loads `.env.${NODE_ENV}` on top of `.env`.

## Backend architecture (`evc-app`)

**Routing is Swagger-driven, not code-driven.** `src/_assets/api.yml` (~1.3k lines, basePath `/api/v1`) declares each path with an `operationId`; `swagger-routes-express` binds that operationId to the same-named export from `src/api/index.ts`. To add an endpoint you must do all three: write the handler in a `src/api/*Controller.ts`, re-export it from `src/api/index.ts`, and add the path + `operationId` to `api.yml`. A missing yml entry means the route silently doesn't exist.

**Express 5 gotchas.** The app runs Express 5 (path-to-regexp 8):

- A bare `'*'` route is a parse error. The SPA fallback in `src/app.ts` uses `'/{*splat}'` — the braces make the wildcard optional so it still matches `/` the way `'*'` did.
- `@types/express` 5 widens `req.params` values to `string | string[]`, because a wildcard can capture an array of segments. `handlerWrapper` (`src/utils/asyncHandler.ts`) pins params to `Record<string, string>` for all controllers, since every api.yml route uses plain `:name` params. Don't re-widen it without also fixing ~45 call sites.
- `req.query` is a getter and cannot be assigned to. All current uses are reads.
- `express-list-endpoints` reads the Express 4 `app._router` and silently returns `[]` on Express 5, so the startup route dump uses `src/utils/listAppEndpoints.ts` instead.

**Auth is cookie-JWT and permissive at the middleware layer.** `src/middlewares/authMiddleware.ts` runs globally: it decodes the JWT cookie, transparently renews it, and sets `req.user` — but never rejects anonymous requests. Authorization is per-handler via `assertRole(req, 'admin', 'agent', ...)` at the top of the controller. Roles: `admin`, `agent`, `member`, `free`, `guest` (`src/types/Role.ts`). Handlers are wrapped in `handlerWrapper` (express-async-handler) and signal failures with `assert(cond, statusCode, message)` from `src/utils/assert.ts`.

**TypeORM 1.x, with a shim for the removed globals.** 1.x deleted `getRepository`/`getManager`/`getConnection`/`createConnection` and the `TYPEORM_*` env auto-config. `src/dataSource.ts` holds a lazily-built `DataSource` plus same-named stand-ins, so the ~350 existing call sites keep their shape - import them from `src/dataSource`, **not** from `typeorm`.

- The DataSource is built lazily because `src/index.ts` imports the controller graph before `loadEnv()` runs dotenv; constructing it at module scope would read an empty `process.env`.
- `src/dataSource.ts` reproduces 0.2's `ConnectionOptionsEnvReader` coercion so `.env` and the separately-deployed `devops/.env.prod` keep working unchanged. **`TYPEORM_DROP_SCHEMA=evc` is in both files and must stay falsy** - 0.2 only accepted `'true'`/`'1'`, so it has always been off. Reading it as "defined means true" would drop the `evc` schema, and every matview in it, on each connect.
- `findOne(id)` / `findOne(conditions)` are gone: use `findOneBy(conditions)`, or `findOne({ where, relations })` when you need options. `find(conditions)` is `findBy`. `select`/`relations` take objects (`{ symbol: true }`), not string arrays.
- `InsertQueryBuilder.onConflict()` is gone. `orUpdate(overwrite, conflictTarget)` covers plain `= EXCLUDED.col` upserts, but it cannot express `count = count + 1`, so the three counter upserts (stock_hot_search, stock_plea, guest_user_stats) are raw parameterized SQL via `getQualifiedTableName()`. Postgres rejects a schema-qualified name on the left of `ON CONFLICT ... DO UPDATE SET`, hence the `AS t` alias.
- The CLI takes an explicit DataSource: `pnpm typeorm <cmd> -d datasource-cli.ts`. That file must export the `getDataSource()` singleton, because the seed migrations call `getRepository()`. Don't add `TS_NODE_TRANSPILE_ONLY` back to the `typeorm` script - it breaks `emitDecoratorMetadata`, so enum-typed columns emit `design:type Object` and 1.x's metadata validator rejects them.

**The fair-value engine is a chain of PostgreSQL materialized views**, not application code. Defined as TypeORM `@ViewEntity({materialized: true})` in `src/entity/views/`. The dependency order matters and is encoded in two places that must stay in sync:

- `MV_REFRESH_ORDER` in `src/refreshMaterializedView.ts` — refresh order (`REFRESH MATERIALIZED VIEW CONCURRENTLY`, guarded by a Redis lock key so concurrent processes skip).
- `createIndexOnMaterilializedView()` in `src/db.ts` — the unique indexes that `CONCURRENTLY` requires.

The pipeline is roughly: `StockHistoricalTtmEps` → `StockDailyPe` → `StockComputedPe90` (90-day rolling PE avg/stddev; fair value = ttmEps × (avg ∓ stddev)) → `StockComputedPe365` (adds 1-year PE lo/hi and forward EPS) → `StockDataInformation` → `StockHistoricalComputedFairValue` (clamps outliers against close price, sets `isAdjustedFairValue`) → `StockLatestFairValue` (overlays admin-entered `StockSpecialFairValue` via COALESCE). Changing a formula means editing the view expression and re-running `pnpm sync:schema`.

`syncDatabaseSchema` in `src/db.ts` drops **all** views/matviews in the `evc` schema before `connection.synchronize()`, because TypeORM cannot order view drops by dependency. Any new view is created fresh on sync; there is no incremental view migration.

**Real-time price/events** go client → SSE (`GET /api/v1/event`, `express-sse-middleware`) ← Redis pub/sub (`src/services/RedisPubSubService.ts`), so multiple API instances can fan out events published by the daemon. A separate WebSocket server (`src/ws.ts`) handles chat rooms only.

**Static serving:** `src/app.ts` serves `evc-app/www` (the frontend build, symlinked in dev by `pnpm link-web`) with a 1-year immutable cache header, and falls back to `index.html` for client-side routes. `/webhook/stripe` is excluded from JSON body parsing — it needs the raw body for signature verification. Note the middleware carve-out exists but the handler does not: `webhookStripe` is declared in api.yml with no matching export, so the route answers 501 from the swagger-routes-express not-implemented stub.

## Batch jobs (`evc-app/endpoints/`)

Every job is a standalone entry file that calls `start(JOB_NAME, fn, opts)` from `endpoints/jobStarter.ts`, which connects the DB, logs start/done/error to `DataLog`, and `process.exit`s (unless `{daemon: true}`). Long jobs additionally take a Redis lock key (`JOBKEY_<name>`) so overlapping ECS runs skip.

In production each job is an ECS scheduled task driven by a CloudWatch Events rule. `endpoints/adjust-cron.ts` is the source of truth for those schedules: it declares them in **New York time** and pushes UTC crons to CloudWatch. It must be re-run at each DST transition (see the comment at the top of that file). Both a `:prod` (compiled JS) and a dev (ts-node) script variant exist for every job in `package.json`.

Data sources: AlphaVantage (EPS, earnings calendar), Barchart scraping, Stripe/PayPal for payments. IEX Cloud integration is dead code (the SSE price daemon early-returns).

`src/services/barchartService.ts` (used by `daily-opc-history` and `daily-uoa`) reaches Barchart's `core-api` proxies **through headless Chrome, not an HTTP client**. Barchart sits behind AWS WAF Bot Control, which answers any plain client — regardless of headers — with an empty `202` + `x-amzn-waf-action: challenge` and no `Set-Cookie`; the old `laravel_token`/`XSRF-TOKEN` cookie bootstrap died with it (Aug 2026). Chrome solves the challenge on page load, so the module keeps **one** Puppeteer page alive per process (`getBarchartSession`) and runs each API call as an in-page `fetch`. Two constraints when touching this file:

- Don't open a session per symbol — the previous code re-poked the landing page once per symbol (~7.8k times a run), which is the pattern bot mitigation looks for.
- Don't use `async`/`await` inside `page.evaluate()`. With `target: es6`, tsc downlevels it into an `__awaiter` helper that doesn't exist in the page, and the call fails at runtime with `__awaiter is not defined`. Use promise chaining.

Puppeteer also renders receipt PDFs (`src/utils/generatePdfBufferFromHtml.ts`). Both call sites launch with `--no-sandbox --disable-setuid-sandbox`. Three things to know:

- **Locally**, `pnpm install` downloads the Chrome build matching the pinned puppeteer version, because `evc-app/.npmrc` sets `only-built-dependencies[]=puppeteer` (pnpm 10 skips dependency lifecycle scripts otherwise). Note the `pnpm.onlyBuiltDependencies` field in `package.json` is **not** honoured by pnpm 10.7.1 — it has to be the `.npmrc`. If the browser is ever missing, `pnpm exec puppeteer browsers install chrome` fetches it. Don't pin an old puppeteer: its Chrome is pinned too, and builds more than a year or so behind the OS crash on launch on current macOS — that was the long-standing "crashes on Apple Silicon" problem, not an arm64 issue.
- **In the image**, `PUPPETEER_SKIP_DOWNLOAD=true` and `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable` reuse the apt-installed Chrome instead of paying ~150MB for a second browser. Those two ENVs must stay **above** the `pnpm install` lines in the Dockerfile, or the allowlisted lifecycle script downloads Chrome before the skip flag is set.
- `page.pdf()` returns a `Uint8Array`, not a `Buffer`. `generatePdfBufferFromHtml` wraps it in `Buffer.from()` because `res.send` and the nodemailer attachments need a real Buffer.

## Frontend architecture (`evc-web`)

- Absolute imports from `src` (`jsconfig.json` `baseUrl: src`) — write `import x from 'services/stockService'`, not relative paths.
- `App.js` handles anonymous/public routes and locale (react-intl, `en-US` / `zh-CN` from `src/translations/`); `AppLoggedIn.js` renders the `@ant-design/pro-layout` shell and builds its route/menu list from `role` (`admin` / `agent` / `member` / `free`). Pages are code-split with `@loadable/component`.
- Shared state is one `GlobalContext` (`src/contexts/GlobalContext.js`) carrying `user`, `role`, `setUser`, and an rxjs `event$` subject fed by the backend SSE stream.
- All API calls go through `src/services/*Service.js` → `src/services/http.js`. That module centralizes `withCredentials`, 401 → "session timeout" modal + reload, and error toasts; it exposes both promise (`httpGet`) and rxjs (`httpGet$`) variants.
- **React 19 + antd 5.** Theming moved out of less: antd 5 dropped less variables, so the palette lives in `src/antdTheme.js` as design tokens passed to `<ConfigProvider theme>`. craco-less stays only for the app's own `index.less`. Use tokens, not hard-coded colors.
- antd 5 ships no less bundle - never `import 'antd/dist/antd.less'`. Locales come from `antd/locale/*`. `PageHeader` and `Comment` are gone; the one PageHeader call site uses the local `components/PageHeader.js` shim.
- **Pickers take dayjs, not moment.** antd 5 swapped its internals. `DateInput`/`RangePickerInput` convert for you; anything else feeding a `value`/`defaultValue` into a picker must pass dayjs. moment is still used for non-antd date work (and for react-big-calendar's `Date` objects), so both libraries are present on purpose.
- **`defaultProps` on function components does nothing in React 19.** All 128 were converted to destructuring defaults, which matches React's old semantics (apply when the prop is `undefined`). Don't reintroduce the pattern - it fails silently.
- Entry point uses `createRoot`, and `src/index.js` imports `@ant-design/v5-patch-for-react-19`, which is what keeps antd 5's imperative `message`/`notification`/`Modal` APIs working on React 19.
- Google SSO is `@react-oauth/google` (Google Identity Services). GIS only issues the id_token the backend reads from **its own rendered button**, so the old custom-antd-button `render` prop is gone for good; theme/size/width are the only styling knobs.
- `craco.config.js` aliases `tslib` to one hoisted copy: `@antv/g2plot` (via `@ant-design/charts`) reaches G2 v4, whose `@antv/adjust` declares tslib ^1.10 but emits `__spreadArray`, a tslib 2.1+ helper. Note pnpm 10.7.1 ignores the `pnpm` field in `package.json` (both `overrides` and `onlyBuiltDependencies`), which is why this is a bundler alias rather than a dependency override.

## Deploy

`devops/Dockerfile` is a single-stage image that installs and builds both sub-projects, copies `evc-web/build` into `evc-app/www`, prunes dev deps, and runs `node index.js`. Production runs two ECS services off the same image in cluster `evc`: `evc-portal` (API + SPA) and `evc-daemon`. `devops/terraform-docker/` holds the infra definition. Note the Dockerfile bakes public client-side keys (Google SSO client id, PayPal client id, Stripe publishable key) as build args — secrets stay in the ECS task env/`devops/.env.prod`.
