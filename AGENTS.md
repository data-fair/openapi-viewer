# openapi-viewer

Contribution guide, dev environment and tests: [CONTRIBUTING.md](CONTRIBUTING.md).

## Dev environment

Docker runs the containers (nginx, simple-directory, mongo); the api and the ui run as node processes.
simple-directory gives the integrated mode its theme, language and admin session (`useSimpleDirectory` in the
development config); the standalone mode needs none of it.

- `npm run dev` — the containers (`npm run dev-deps`), then the api and the ui in the terminal (Ctrl+C stops
  them), at `http://localhost:6200/openapi-viewer/dev`. Their logs are in `dev/logs/` (`DEV_LOG_DIR`,
  `DEV_LOG_PREFIX`).
- `npm run dev-deps` — the containers only, plus `npm run dev-setup`.
- `npm run dev-setup` — idempotent builds (types), no container.
- `npm run dev:api`, `dev:ui` — one process each, with the variables of `.env` exported.
- `npm run stop-dev-deps` — stops the containers.

Default ports (6200-6205) are in `dev/default.env`, copied to `.env` the first time: `.env` overrides it and is
never overwritten. Production names override the development config: `PORT`, `PRIVATE_DIRECTORY_URL`,
`USE_SIMPLE_DIRECTORY`, `ALLOWED_URLS`, `DEFAULT_URL`.

- Read the logs before restarting: nodemon (api) and vite (ui) already reload on file changes.
- Do not start, stop or restart the dev processes or containers of the user: ask.
- Never `npm ci` / `npm install` while the env runs (the watchers restart on half-installed modules).
- The tests (`npm test`, Playwright): `unit` needs no dev env, `e2e` runs against the ui through nginx. The viewer
  stores nothing and the tests do not log in: no test API, no test sub-space. `npm run quality` (the pre-push
  hook) runs them all, so it needs the dev env.

Design specs and implementation plans are not kept in this repository; durable architecture docs live in `docs/architecture/`.
