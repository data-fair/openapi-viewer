# Contribution guidelines

## Prerequisites

- A Javascript/Typescript IDE with [Vue.js](https://vuejs.org/) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) support.
- A recent [Docker](https://docs.docker.com/engine/install/) installation.
- [Node.js v24.22.1+](https://nodejs.org/)
- [zellij](https://zellij.dev/) >= 0.44.

## Install dependencies

Install npm dependencies for all workspaces, then generate `.env` (ports), the types and the UI build:

```sh
npm ci
npx --no df-dev setup
```

Pull images at first and then once in a while:

```sh
docker compose --profile '*' pull
```

## Run the development servers

The UI is a [Vite](https://vite.dev/) + Vue project, the API a small [Express](https://expressjs.com) server.
The development servers run in a zellij session, see `@data-fair/lib-dev`:

```sh
npm run dev-zellij
```

The session prints the URL of the dev page, which links to the example documentations. The dev environment
runs simple-directory (theme, language, admin session), like the viewer embedded in the data-fair stack; the
standalone mode (`USE_SIMPLE_DIRECTORY=false`, see the README) needs none of it.

Agents operate the running environment with `npx --no df-dev status | logs <pane> | restart <pane>`.

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
- **e2e** (`tests/*.e2e.spec.ts`) — behavioural checks against the running app.
  Committed but **not run in CI** (they need the full stack).
- **snapshot** (`tests/*.snap.spec.ts`) — visual screenshots. **Local only**:
  spec files and baseline images are gitignored and never committed.

```sh
# unit tests only (no stack needed)
npm run test-unit

# e2e / snapshot need the dev environment running (see above)
npm run test-e2e
npm run test-snapshot

# review visual diffs side by side (expected / actual / diff)
npx playwright show-report
```

The snapshot project is meant for **manual** visual non-regression review (e.g.
before/after a major Vuetify upgrade): capture baselines, re-run after the
change, then walk the HTML report to judge each diff.
