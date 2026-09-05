FROM --platform=linux/amd64 node:24-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.7.1 --activate

# ENV PNPM_STORE_PATH=/pnpm-store
# RUN pnpm config set store-dir $PNPM_STORE_PATH

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y bzip2 google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 build-essential chrpath libssl-dev libxft-dev\
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

RUN apt-get install libfreetype6 libfreetype6-dev
RUN apt-get install libfontconfig1 libfontconfig1-dev

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-stable'})
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install puppeteer so it's available in the container.
# RUN npm i puppeteer \
#     # Add user so we don't need --no-sandbox.
#     # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
#     && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#     && mkdir -p /home/pptruser/Downloads \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /node_modules

# # Run everything after as non-privileged user.
# USER pptruser

# RUN npm install -g pnpm
#RUN apk update && apk add curl

# RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

# install node-prune (https://github.com/tj/node-prune)
# RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | sh -s -- -b /usr/local/bin

EXPOSE 80

# --- Dependencies -----------------------------------------------------------------------------
# This is a pnpm workspace: ONE root lockfile covers both packages, so the install is a single
# root-level step rather than the old per-folder `pnpm fetch` + `pnpm install` pair.
WORKDIR /usr/portal

# evc-app allowlists puppeteer in the root .npmrc (`only-built-dependencies[]=puppeteer`) so a
# local `pnpm install` fetches the Chrome build matching the puppeteer version. The image must
# NOT do that: it already installed google-chrome-stable above, and a second browser costs
# ~150MB. These two must stay ABOVE the `pnpm install` line, otherwise the allowlisted
# lifecycle script downloads Chrome before the skip flag is ever set.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# `pnpm fetch` reads only the lockfile, so this layer stays cached until a dependency changes -
# editing source never re-downloads. It needs .npmrc for the puppeteer allowlist and
# pnpm-workspace.yaml to know it is a workspace.
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc /usr/portal/
RUN pnpm fetch

# Manifests only, so the install layer is invalidated by dependency edits and not by source.
COPY package.json /usr/portal/
COPY evc-app/package.json /usr/portal/evc-app/
COPY evc-web/package.json /usr/portal/evc-web/
RUN pnpm install --offline --frozen-lockfile

# Env vars in build time
ARG NODE_ENV
ARG REACT_APP_GIT_HASH
ENV TZ=utc
ENV GIT_HASH=$REACT_APP_GIT_HASH
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=4096
ENV REACT_APP_EVC_API_ENDPOINT=/api/v1
ENV REACT_APP_EVC_GOOGLE_SSO_CLIENT_ID=305430338996-fmmjqqkon9hvngpctccis9t1biqtqile.apps.googleusercontent.com
ENV REACT_APP_EVC_PAYPAL_CLIENT_ID=AQ7I1Qy9ngFsqIHt1rQAziFADJiE9441IEmXFiqEM5kWNWM_SqKKtfClcViWRDcs3rQ2OW_T4q8JE53s
ENV REACT_APP_EVC_STRIPE_PUBLISHABLE_KEY=pk_live_51IInHqCYziaQFA3RyLzcmjJkKRBjaZE5r2rSV1klrYD5KhFAOPw4VJwy7TpCxqtW4Ct7Oi5iPn6PCVeVTr2KDeie00BqdMlBsC

# --- Build ------------------------------------------------------------------------------------
# Only the two packages, not the whole context: devops/, docs/, perf/ and the terraform state
# have no business in the runtime image.
COPY evc-app /usr/portal/evc-app
COPY evc-web /usr/portal/evc-web

# Order matters: evc-app's `build:prod` starts with `rm -rf www`, so the frontend has to be
# copied in AFTER the backend compile, not before.
RUN pnpm --filter evc-app run build:prod
RUN pnpm --filter web run compile:prod
RUN cp -rf /usr/portal/evc-web/build /usr/portal/evc-app/www

# --- Prune to a runtime-only tree -------------------------------------------------------------
# The old image just did `pnpm prune --production` + `rm -rf web`, which worked because each
# folder owned its own node_modules. In a workspace both packages share the root virtual store,
# so deleting evc-web would leave every one of its deps (react, antd, vite...) behind in
# /usr/portal/node_modules/.pnpm.
#
# `pnpm deploy` is the workspace answer: it materialises a self-contained, prod-only node_modules
# for one package. We take ONLY its node_modules and keep the real evc-app directory, because
# deploy copies package files by npm packing rules, which fall back to .gitignore when there is
# no `files` field - and evc-app/.gitignore lists `**/*.js` while the root one lists
# `evc-app/www`. Letting deploy copy the app itself would ship it with no compiled output and no
# frontend. --legacy is required: pnpm 10's default deploy path wants inject-workspace-packages.
#
# Note this does not shrink the finished image, exactly as the old `prune` + `rm -rf web` did
# not: Docker layers are additive, so a delete in a later layer only hides the bytes. It is
# about giving the container a correct prod-only tree. Making the image genuinely smaller needs
# a second stage that COPYs just /usr/portal/evc-app - a separate change.
RUN pnpm --filter evc-app --prod --legacy deploy /deploy \
  && rm -rf /usr/portal/evc-app/node_modules \
  && mv /deploy/node_modules /usr/portal/evc-app/node_modules \
  && rm -rf /deploy /usr/portal/evc-web /usr/portal/node_modules

# RUN npm uninstall -g pnpm

# Start the portal website
WORKDIR /usr/portal/evc-app

# CMD node index.js
CMD node index.js
