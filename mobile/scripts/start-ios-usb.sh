#!/usr/bin/env bash
# USB-connected iPhone: forward device loopback :8082 → Mac Metro on :8082
# Requires: brew install libimobiledevice  (provides iproxy)
# Then scan the QR (exp://127.0.0.1:8082) — works when campus Wi‑Fi blocks LAN Metro.

set -euo pipefail
PORT="${1:-8082}"

if ! command -v iproxy >/dev/null 2>&1; then
  echo "Missing iproxy. Install with:  brew install libimobiledevice"
  exit 1
fi

iproxy "${PORT}" "${PORT}" &
PROXY_PID=$!
cleanup() {
  kill "${PROXY_PID}" 2>/dev/null || true
}
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

echo "iproxy forwarding device 127.0.0.1:${PORT} → this Mac (keep USB plugged in)."
cd "$(dirname "$0")/.."
npx expo start --localhost --port "${PORT}"
STATUS=$?
cleanup
exit "${STATUS}"
