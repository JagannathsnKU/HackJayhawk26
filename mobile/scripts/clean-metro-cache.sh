#!/usr/bin/env bash
# Metro wrote a file-map disk cache from another Node/Metro version → "Unable to deserialize cloned data".
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

rm -rf node_modules/.cache/metro 2>/dev/null || true
rm -rf node_modules/.cache/metro-file-map 2>/dev/null || true
rm -rf node_modules/.cache/babel-loader 2>/dev/null || true

TMP="${TMPDIR:-/tmp}"
# shellcheck disable=SC2086
rm -rf "$TMP"/metro-* "$TMP"/haste-map-* "$TMP"/react-* 2>/dev/null || true

# Stale Expo CLI module metadata (can break `expo install` / tooling after Node upgrades)
if [[ -d "$HOME/.expo/native-modules-cache" ]]; then
  rm -rf "$HOME/.expo/native-modules-cache"/* 2>/dev/null || true
fi

echo "Metro caches cleared under $ROOT/node_modules/.cache and $TMP (best effort)."
