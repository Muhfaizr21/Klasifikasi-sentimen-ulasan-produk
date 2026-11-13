#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-$HOME/.venvs/tubes/bin/python}"
BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

if [ ! -x "$PYTHON_BIN" ]; then
  echo "[dev] venv tidak ditemukan: $PYTHON_BIN" >&2
  echo "[dev] buat: python3.11 -m venv ~/.venvs/tubes && ~/.venvs/tubes/bin/pip install flask flask-cors" >&2
  exit 1
fi

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  trap - EXIT INT TERM
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd "$ROOT/backend" && exec "$PYTHON_BIN" -m flask --app app.main:app run --port "$BACKEND_PORT" --debug --no-reload) &
BACKEND_PID=$!
echo "[dev] Flask → http://127.0.0.1:$BACKEND_PORT"

(cd "$ROOT/frontend" && exec ./node_modules/.bin/vite --port "$FRONTEND_PORT") &
FRONTEND_PID=$!
echo "[dev] Vite  → http://127.0.0.1:$FRONTEND_PORT"

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done

echo "[dev] salah satu proses berhenti, menutup keduanya..." >&2
cleanup
