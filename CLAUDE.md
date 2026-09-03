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

Both frontend scripts need `NODE_OPTIONS=--openssl-legacy-provider --no-experimental-fetch` (already baked into the scripts) because of react-scripts 5 on modern Node.

Local config lives in gitignored `.env` files: `evc-app/.env` (TypeORM `TYPEORM_*` vars, AWS, Redis, Stripe/PayPal, AlphaVantage, Google SSO) and `evc-web/.env` (`REACT_APP_*`). `evc-app/src/index.ts` hard-fails at boot if required env vars are missing, and in non-prod also loads `.env.${NODE_ENV}` on top of `.env`.

## Backend architecture (`evc-app`)

**Routing is Swagger-driven, not code-driven.** `src/_assets/api.yml` (~1.3k lines, basePath `/api/v1`) declares each path with an `operationId`; `swagger-routes-express` binds that operationId to the same-named export from `src/api/index.ts`. To add an endpoint you must do all three: write the handler in a `src/api/*Controller.ts`, re-export it from `src/api/index.ts`, and add the path + `operationId` to `api.yml`. A missing yml entry means the route silently doesn't exist.

**Auth is cookie-JWT and permissive at the middleware layer.** `src/middlewares/authMiddleware.ts` runs globally: it decodes the JWT cookie, transparently renews it, and sets `req.user` — but never rejects anonymous requests. Authorization is per-handler via `assertRole(req, 'admin', 'agent', ...)` at the top of the controller. Roles: `admin`, `agent`, `member`, `free`, `guest` (`src/types/Role.ts`). Handlers are wrapped in `handlerWrapper` (express-async-handler) and signal failures with `assert(cond, statusCode, message)` from `src/utils/assert.ts`.

**The fair-value engine is a chain of PostgreSQL materialized views**, not application code. Defined as TypeORM `@ViewEntity({materialized: true})` in `src/entity/views/`. The dependency order matters and is encoded in two places that must stay in sync:

- `MV_REFRESH_ORDER` in `src/refreshMaterializedView.ts` — refresh order (`REFRESH MATERIALIZED VIEW CONCURRENTLY`, guarded by a Redis lock key so concurrent processes skip).
- `createIndexOnMaterilializedView()` in `src/db.ts` — the unique indexes that `CONCURRENTLY` requires.

The pipeline is roughly: `StockHistoricalTtmEps` → `StockDailyPe` → `StockComputedPe90` (90-day rolling PE avg/stddev; fair value = ttmEps × (avg ∓ stddev)) → `StockComputedPe365` (adds 1-year PE lo/hi and forward EPS) → `StockDataInformation` → `StockHistoricalComputedFairValue` (clamps outliers against close price, sets `isAdjustedFairValue`) → `StockLatestFairValue` (overlays admin-entered `StockSpecialFairValue` via COALESCE). Changing a formula means editing the view expression and re-running `pnpm sync:schema`.

`syncDatabaseSchema` in `src/db.ts` drops **all** views/matviews in the `evc` schema before `connection.synchronize()`, because TypeORM cannot order view drops by dependency. Any new view is created fresh on sync; there is no incremental view migration.

**Real-time price/events** go client → SSE (`GET /api/v1/event`, `express-sse-middleware`) ← Redis pub/sub (`src/services/RedisPubSubService.ts`), so multiple API instances can fan out events published by the daemon. A separate WebSocket server (`src/ws.ts`) handles chat rooms only.

**Static serving:** `src/app.ts` serves `evc-app/www` (the frontend build, symlinked in dev by `pnpm link-web`) with a 1-year immutable cache header, and falls back to `index.html` for client-side routes. `/webhook/stripe` is excluded from JSON body parsing — it needs the raw body for signature verification.

## Batch jobs (`evc-app/endpoints/`)

Every job is a standalone entry file that calls `start(JOB_NAME, fn, opts)` from `endpoints/jobStarter.ts`, which connects the DB, logs start/done/error to `DataLog`, and `process.exit`s (unless `{daemon: true}`). Long jobs additionally take a Redis lock key (`JOBKEY_<name>`) so overlapping ECS runs skip.

In production each job is an ECS scheduled task driven by a CloudWatch Events rule. `endpoints/adjust-cron.ts` is the source of truth for those schedules: it declares them in **New York time** and pushes UTC crons to CloudWatch. It must be re-run at each DST transition (see the comment at the top of that file). Both a `:prod` (compiled JS) and a dev (ts-node) script variant exist for every job in `package.json`.

Data sources: AlphaVantage (EPS, earnings calendar), Barchart scraping, Stripe/PayPal for payments. IEX Cloud integration is dead code (the SSE price daemon early-returns).

`src/services/barchartService.ts` scrapes Barchart with plain axios: it first pokes a public page to harvest `laravel_token`/`XSRF-TOKEN` cookies (`getBarChartGuestAccess`), then calls the `core-api` proxies with those. Barchart sits behind AWS WAF Bot Control, which answers unsolved clients with an empty `202` + `x-amzn-waf-action: challenge` and no `Set-Cookie` — so this bootstrap is the fragile part of both `daily-opc-history` and `daily-uoa`. Puppeteer is *not* used for scraping; it only renders receipt PDFs (`src/utils/generatePdfBufferFromHtml.ts`), which is why the Docker image installs google-chrome-stable.

## Frontend architecture (`evc-web`)

- Absolute imports from `src` (`jsconfig.json` `baseUrl: src`) — write `import x from 'services/stockService'`, not relative paths.
- `App.js` handles anonymous/public routes and locale (react-intl, `en-US` / `zh-CN` from `src/translations/`); `AppLoggedIn.js` renders the `@ant-design/pro-layout` shell and builds its route/menu list from `role` (`admin` / `agent` / `member` / `free`). Pages are code-split with `@loadable/component`.
- Shared state is one `GlobalContext` (`src/contexts/GlobalContext.js`) carrying `user`, `role`, `setUser`, and an rxjs `event$` subject fed by the backend SSE stream.
- All API calls go through `src/services/*Service.js` → `src/services/http.js`. That module centralizes `withCredentials`, 401 → "session timeout" modal + reload, and error toasts; it exposes both promise (`httpGet`) and rxjs (`httpGet$`) variants.
- antd theming is done with less `modifyVars` in `craco.config.js` (primary green `#57BB60`), so component styles should use antd tokens rather than hard-coded colors.

## Deploy

`devops/Dockerfile` is a single-stage image that installs and builds both sub-projects, copies `evc-web/build` into `evc-app/www`, prunes dev deps, and runs `node index.js`. Production runs two ECS services off the same image in cluster `evc`: `evc-portal` (API + SPA) and `evc-daemon`. `devops/terraform-docker/` holds the infra definition. Note the Dockerfile bakes public client-side keys (Google SSO client id, PayPal client id, Stripe publishable key) as build args — secrets stay in the ECS task env/`devops/.env.prod`.
