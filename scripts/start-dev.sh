#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$ROOT_DIR/AURA-AI-BACKEND"
FRONTEND_DIR="$ROOT_DIR/AURA-AI-FRONTEND"
LOG_DIR="${TMPDIR:-/tmp}/aura-ia-dev-logs"
FRONTEND_URL="http://localhost:5173"
PRODUCTION_BACKEND_URL="https://api.aura-ia.es"
PRODUCTION_API_BASE_URL="$PRODUCTION_BACKEND_URL/api/v1"
LOCAL_BACKEND=false

case "${1:-start}" in
  local-backend|--local-backend|real-env|--real-env)
    LOCAL_BACKEND=true
    shift || true
    ;;
esac

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
if [[ "$LOCAL_BACKEND" == false ]]; then
  BACKEND_URL="$PRODUCTION_BACKEND_URL"
  BACKEND_HEALTH_URL="$PRODUCTION_BACKEND_URL/actuator/health"
fi

mkdir -p "$LOG_DIR"

ensure_command() {
  local name="$1"
  local hint="$2"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "Error: no se encontro '$name'. $hint" >&2
    exit 1
  fi
}

ensure_frontend_layout() {
  [[ -d "$FRONTEND_DIR" ]] || { echo "Error: no se encontro $FRONTEND_DIR." >&2; exit 1; }
  [[ -f "$FRONTEND_DIR/package.json" ]] || { echo "Error: no se encontro AURA-AI-FRONTEND/package.json." >&2; exit 1; }
}

ensure_backend_layout() {
  [[ -d "$BACKEND_DIR" ]] || { echo "Error: no se encontro $BACKEND_DIR. Clona AURA-AI-BACKEND como carpeta hermana de AURA-AI-FRONTEND." >&2; exit 1; }
  [[ -f "$BACKEND_DIR/mvnw" ]] || { echo "Error: no se encontro AURA-AI-BACKEND/mvnw." >&2; exit 1; }
}

ensure_local_backend_env() {
  [[ "$LOCAL_BACKEND" == true ]] || return 0
  if [[ ! -f "$BACKEND_DIR/.env" ]]; then
    if [[ -f "$BACKEND_DIR/.env.example" ]]; then
      cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
      echo "Se ha creado AURA-AI-BACKEND/.env desde .env.example."
    fi
    echo "Error: el modo backend local necesita AURA-AI-BACKEND/.env con credenciales reales de PostgreSQL/Supabase." >&2
    exit 1
  fi
}

ensure_frontend_dependencies() {
  if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    echo "node_modules no existe. Ejecutando npm ci en AURA-AI-FRONTEND..."
    (cd "$FRONTEND_DIR" && npm ci)
  fi
}

configure_frontend_environment() {
  if [[ "$LOCAL_BACKEND" == true ]]; then
    export VITE_API_BASE_URL="http://localhost:$BACKEND_PORT/api/v1"
    unset VITE_DEV_API_PROXY_TARGET || true
    echo "Frontend conectado al backend local: $VITE_API_BASE_URL"
  else
    export VITE_API_BASE_URL="/api/v1"
    export VITE_DEV_API_PROXY_TARGET="$PRODUCTION_BACKEND_URL"
    export VITE_DEV_MODE=false
    echo "Modo tutor: frontend local con proxy Vite hacia $PRODUCTION_API_BASE_URL"
  fi
  export VITE_DEFAULT_LOCALE="${VITE_DEFAULT_LOCALE:-es}"
}

print_log_tail() {
  local name="$1"
  local path="$2"
  [[ -f "$path" ]] || return 0
  echo
  echo "$name ($path):"
  tail -n 40 "$path" || true
}

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
    echo "Usage: ./start-dev.sh [start|stop|local-backend|real-env]"
    exit 2
    ;;
esac

ensure_frontend_layout
ensure_command npm "Instala Node.js 20 o superior."

if [[ "$LOCAL_BACKEND" == true ]]; then
  ensure_backend_layout
  ensure_local_backend_env
  ensure_command java "Instala JDK 21."
fi

ensure_frontend_dependencies
configure_frontend_environment

if [[ "$LOCAL_BACKEND" == true ]]; then
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
else
  echo "Backend local no arrancado; se usa el backend real $PRODUCTION_BACKEND_URL mediante proxy."
fi

if [[ -z "$(port_pids 5173)" ]]; then
  :
else
  echo "Restarting Vite on :5173 to load current env/code..."
  stop_port 5173 "Vite"
fi

echo "Starting Frontend (Vite)..."
(
  cd "$FRONTEND_DIR"
  npm run dev -- --host localhost --port 5173 --strictPort
) >"$LOG_DIR/frontend-dev.log" 2>&1 &
echo $! >"$LOG_DIR/frontend.pid"

backend_ready=false
frontend_ready=false

if [[ "$LOCAL_BACKEND" == true ]]; then
  if wait_http_ready "Backend" "$BACKEND_HEALTH_URL" 90; then
    backend_ready=true
  else
    print_log_tail "Backend log" "$LOG_DIR/backend-dev.log"
  fi
else
  backend_ready=true
  echo "Backend real configurado como proxy target: $PRODUCTION_BACKEND_URL"
fi

if wait_http_ready "Frontend" "$FRONTEND_URL" 45; then
  frontend_ready=true
else
  print_log_tail "Frontend log" "$LOG_DIR/frontend-dev.log"
fi

if [[ "$frontend_ready" == true ]]; then
  open_browser "$FRONTEND_URL" || true
elif [[ "$backend_ready" == true ]]; then
  echo "Backend is ready, but Vite is not. Check $LOG_DIR/frontend-dev.log."
fi

echo
echo "Backend  -> $BACKEND_URL  (health: /actuator/health)"
echo "Frontend -> $FRONTEND_URL"
if [[ "$LOCAL_BACKEND" == false ]]; then
  echo "API      -> $FRONTEND_URL/api/v1/* proxy -> $PRODUCTION_API_BASE_URL/*"
fi
echo "Logs     -> $LOG_DIR"
echo
echo "Para parar todo: ./start-dev.sh stop"
