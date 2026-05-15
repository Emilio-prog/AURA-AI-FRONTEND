#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$ROOT_DIR/AURA-AI-BACKEND"
FRONTEND_DIR="$ROOT_DIR/AURA-AI-FRONTEND"
LOG_DIR="$ROOT_DIR/.dev-logs"

env_file_value() {
  local path="$1"
  local key="$2"
  if [[ ! -f "$path" ]]; then
    return 0
  fi

  local line
  line="$(grep -E "^[[:space:]]*${key}[[:space:]]*=" "$path" | tail -n 1 || true)"
  if [[ -z "$line" ]]; then
    return 0
  fi

  local value="${line#*=}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "$value"
}

BACKEND_PORT="${SERVER_PORT:-$(env_file_value "$BACKEND_DIR/.env" "SERVER_PORT")}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
BACKEND_URL="http://localhost:$BACKEND_PORT"
BACKEND_HEALTH_URL="$BACKEND_URL/actuator/health"
FRONTEND_URL="http://localhost:5173"

mkdir -p "$LOG_DIR"

port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true
  elif command -v fuser >/dev/null 2>&1; then
    fuser "$port"/tcp 2>/dev/null || true
  fi
}

stop_port() {
  local port="$1"
  local name="$2"
  local pids
  pids="$(port_pids "$port")"
  if [[ -z "$pids" ]]; then
    echo "$name on :$port already stopped"
    return
  fi

  echo "Stopping $name on :$port (PID $pids)"
  kill $pids 2>/dev/null || true
  sleep 1

  pids="$(port_pids "$port")"
  if [[ -n "$pids" ]]; then
    kill -9 $pids 2>/dev/null || true
  fi
}

http_ready() {
  local url="$1"
  curl -fsS --max-time 2 "$url" >/dev/null 2>&1
}

wait_http_ready() {
  local name="$1"
  local url="$2"
  local timeout_seconds="$3"
  local start
  local now
  start="$(date +%s)"

  echo "Waiting for $name at $url ..."
  while true; do
    if http_ready "$url"; then
      echo "$name is ready"
      return 0
    fi

    now="$(date +%s)"
    if (( now - start >= timeout_seconds )); then
      echo "Warning: $name did not respond at $url within ${timeout_seconds}s."
      return 1
    fi
    sleep 2
  done
}

open_browser() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 &
  elif command -v wslview >/dev/null 2>&1; then
    wslview "$url" >/dev/null 2>&1 &
  else
    echo "Could not open the browser automatically. Open this URL manually: $url"
    return 1
  fi
  echo "Browser opened at $url"
}

case "${1:-start}" in
  stop|--stop|-s)
    stop_port "$BACKEND_PORT" "Backend"
    if [[ "$BACKEND_PORT" != "8080" ]]; then
      stop_port 8080 "Backend default"
    fi
    stop_port 5173 "Vite"
    exit 0
    ;;
  start|"")
    ;;
  *)
    echo "Usage: ./start-dev.sh [start|stop]"
    exit 2
    ;;
esac

if [[ -z "$(port_pids "$BACKEND_PORT")" ]]; then
  if [[ "$BACKEND_PORT" != "8080" ]]; then
    echo "Warning: AURA-AI-BACKEND/.env sets SERVER_PORT=$BACKEND_PORT. Backend will use $BACKEND_URL."
    echo "To use the documented default, set SERVER_PORT=8080 or remove that line."
  fi
  echo "Starting Backend (Spring Boot)..."
  (
    cd "$BACKEND_DIR"
    ./mvnw spring-boot:run
  ) >"$LOG_DIR/backend-dev.log" 2>&1 &
  echo $! >"$LOG_DIR/backend.pid"
else
  echo "Backend already running on :$BACKEND_PORT"
fi

if [[ -z "$(port_pids 5173)" ]]; then
  echo "Starting Frontend (Vite)..."
  (
    cd "$FRONTEND_DIR"
    npm run dev -- --host localhost --port 5173 --strictPort
  ) >"$LOG_DIR/frontend-dev.log" 2>&1 &
  echo $! >"$LOG_DIR/frontend.pid"
else
  echo "Vite already running on :5173"
fi

backend_ready=false
frontend_ready=false

if wait_http_ready "Backend" "$BACKEND_HEALTH_URL" 90; then
  backend_ready=true
fi

if wait_http_ready "Frontend" "$FRONTEND_URL" 45; then
  frontend_ready=true
fi

if [[ "$frontend_ready" == true ]]; then
  open_browser "$FRONTEND_URL" || true
elif [[ "$backend_ready" == true ]]; then
  echo "Backend is ready, but Vite is not. Check $LOG_DIR/frontend-dev.log."
fi

echo
echo "Backend  -> $BACKEND_URL  (health: /actuator/health)"
echo "Frontend -> $FRONTEND_URL"
echo "Logs     -> $LOG_DIR"
echo
echo "Para parar todo: ./start-dev.sh stop"
