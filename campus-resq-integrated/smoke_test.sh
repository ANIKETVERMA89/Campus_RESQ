#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
API_PORT="${API_PORT:-18080}"
FRONTEND_PORT="${FRONTEND_PORT:-18000}"
cd "$ROOT"
make -C Campus_RESQ-develop api
API_PORT="$API_PORT" FRONTEND_PORT="$FRONTEND_PORT" ./start.sh >/tmp/campus-resq-smoke.log 2>&1 &
LAUNCH_PID=$!
cleanup() { kill "$LAUNCH_PID" 2>/dev/null || true; }
trap cleanup EXIT
for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:$FRONTEND_PORT/api/health" >/dev/null 2>&1; then break; fi
  sleep 0.25
done
curl -fsS "http://127.0.0.1:$FRONTEND_PORT/api/health" | grep -q 'Campus RESQ C++ API'
curl -fsS "http://127.0.0.1:$FRONTEND_PORT/api/route?from=1&to=4&algorithm=dijkstra" | grep -q '"distance":60'
curl -fsS "http://127.0.0.1:$FRONTEND_PORT/api/plan?type=medical&loc=5&severity=6" | grep -q '"evac"'
curl -fsS "http://127.0.0.1:$FRONTEND_PORT/" | grep -q 'Campus RESQ'
echo "Campus RESQ smoke tests passed."
