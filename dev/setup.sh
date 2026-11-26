#!/usr/bin/env bash
# Idempotent builds needed before the dev processes and the tests: generated types. No containers.
# Usage: npm run dev-setup
set -euo pipefail
cd "$(dirname "$0")/.."

# the api config is validated with them at startup, the ui dev server imports it
[ -d api/config/type/.type ] || npm run build-types
