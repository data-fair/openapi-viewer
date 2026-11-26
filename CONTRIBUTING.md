# Contribution guidelines

## Prerequisites

- A Javascript/Typescript IDE with [Vue.js](https://vuejs.org/) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) support.
- A recent [Docker](https://docs.docker.com/engine/install/) installation.
- [Node.js v24.22.1+](https://nodejs.org/)

## Quick start

```sh
npm ci
npm run dev
```

Docker is required: nginx, simple-directory and mongo run in containers; the api and the ui run in the terminal
(Ctrl+C stops them, their logs are in `dev/logs/`). The dev page, which links to the example documentations, is
available at <http://localhost:6200/openapi-viewer/dev>.

Pull images at first and then once in a while:

```sh
docker compose pull
```

## Run the development servers

The UI is a [Vite](https://vite.dev/) + Vue project, the API a small [Express](https://expressjs.com) server.

The default ports (6200-6205) are in `dev/default.env`, copied to `.env` the first time: `.env` overrides
`dev/default.env` and is never overwritten. `npm run dev-deps` only starts the containers (extra arguments go to
docker compose); `npm run dev` accepts the same arguments.

Each dev process has its own npm script and reads its settings from environment variables (every key of
`dev/default.env`): `npm run dev-setup` (idempotent builds, no container), then `npm run dev:api` and
`npm run dev:ui`, each in its own terminal with the variables of `.env` exported. The production names (`PORT`,
`PRIVATE_DIRECTORY_URL`, `USE_SIMPLE_DIRECTORY`, `ALLOWED_URLS`...) override the development config.
`DEV_LOG_DIR` (default `dev/logs`) and `DEV_LOG_PREFIX` set where `npm run dev` writes the logs of the processes.

The dev environment runs simple-directory (theme, language, admin session), like the viewer embedded in the
data-fair stack; the standalone mode (`USE_SIMPLE_DIRECTORY=false`, see the README) needs none of it. It holds no
account: one for the admin session can be seeded through its test API (`POST /simple-directory/api/test-env/seed`).

The fixed ports mean one environment per machine: stop the containers of one checkout
(`npm run stop-dev-deps`) before starting another.

## Stop the development environment

```sh
npm run stop-dev-deps
```

## Working on types

Update the types based on schemas:

```sh
npm run build-types
```

## Building the Docker image

```sh
docker build --progress=plain --target=main -t data-fair/openapi-viewer:dev .
```

## Tests

Tests use [Playwright](https://playwright.dev/). Three projects are defined in
`playwright.config.ts` :

- **unit** (`tests/*.unit.spec.ts`) — pure functions (e.g. query params
  serialization), no browser, no running stack. Run in CI.
- **e2e** (`tests/*.e2e.spec.ts`) — behavioural checks against the running app
  (`npm run dev`). Run in CI, on the same dev environment.
- **snapshot** (`tests/*.snap.spec.ts`) — visual screenshots. **Local only**:
  spec files and baseline images are gitignored and never committed.

```sh
# unit and e2e tests, the e2e ones need the dev environment running (see above)
npm test

# unit tests only (no dev environment needed)
npm run test-unit

# e2e / snapshot alone
npm run test-e2e
npm run test-snapshot

# review visual diffs side by side (expected / actual / diff)
npx playwright show-report
```

`npm run quality` runs the whole gate (lint, types, unit and e2e tests, audit); the pre-push hook runs it, with
the dev environment running.

The snapshot project is meant for **manual** visual non-regression review (e.g.
before/after a major Vuetify upgrade): capture baselines, re-run after the
change, then walk the HTML report to judge each diff.
