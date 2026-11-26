#!/usr/bin/env bash
# Start the dev dependencies (nginx, simple-directory, mongo) with docker compose.
# Usage: npm run dev-deps [-- <docker compose args>]
# The compose project is COMPOSE_PROJECT_NAME, the folder name by default.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -e .env ] && [ ! -L .env ]; then
  cp dev/default.env .env
  echo "created .env from dev/default.env (edit .env to override, it is never overwritten)"
fi
# a .env link belongs to a larger dev environment that runs this checkout: these containers need a project name of
# their own, the folder name may be another checkout's
if [ -L .env ] && [ -z "${COMPOSE_PROJECT_NAME:-}" ]; then
  echo ".env is a link: set COMPOSE_PROJECT_NAME to start this checkout's own containers" >&2
  exit 1
fi

# generated types needed by the api, the ui and the tests, built once
npm run dev-setup

docker compose --progress quiet "$@" up -d --wait
