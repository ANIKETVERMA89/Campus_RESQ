#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
API_PORT="${API_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-8000}"
make -C Campus_RESQ-develop api
./Campus_RESQ-develop/build/campus-resq-api "$API_PORT" &
API_PID=$!
WEB_PID=""
cleanup() {
  if [[ -n "$WEB_PID" ]]; then kill "$WEB_PID" 2>/dev/null || true; fi
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
sleep 1
if ! kill -0 "$API_PID" 2>/dev/null; then
  echo "Could not start the C++ API on port $API_PORT (is the port already in use?)" >&2
  exit 1
fi
API_PORT="$API_PORT" FRONTEND_PORT="$FRONTEND_PORT" python3 run.py &
WEB_PID=$!
wait "$WEB_PID"
