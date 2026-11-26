#!/usr/bin/env bash
# Minimal dev environment: dependencies, api and ui, in one terminal. Ctrl+C stops them.
# Usage: npm run dev [-- <docker compose args>]
set -euo pipefail
cd "$(dirname "$0")/.."

bash dev/deps.sh "$@"

set -a
. ./.env
set +a

# where the processes write their logs, dev/logs by default
log_dir=${DEV_LOG_DIR:-dev/logs}
log_prefix=${DEV_LOG_PREFIX:-}
mkdir -p "$log_dir"
set -m
pids=()
cleanup () {
  trap - EXIT INT TERM
  # each process runs in its own process group (set -m): stop npm and what it started
  for pid in "${pids[@]}"; do kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for process in api ui; do
  npm run "dev:$process" < /dev/null > "$log_dir/${log_prefix}$process.log" 2>&1 &
  pids+=($!)
done

echo "logs in $log_dir (${log_prefix}api.log, ${log_prefix}ui.log)"
echo "dev server available at http://$DEV_HOST:$NGINX_PORT/openapi-viewer/dev"
# stop everything as soon as one process exits
wait -n || true
