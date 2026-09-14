#!/bin/bash
set -u

REPO="/Users/joseph/AI-OS"
LOG_DIR="$REPO/production-data/logs"
mkdir -p "$LOG_DIR"
cd "$REPO" || exit 1

export HOME="/Users/joseph"
export USER="joseph"
export LOGNAME="joseph"
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_ENV=production
export AI_OS_ENV_FILE="$REPO/.env.production"
export AI_OS_DATA_DIR="$REPO/production-data/api"
export AI_OS_STATE_DIR="$REPO/production-data/state"
export AI_OS_REDDIT_DATA_DIR="$REPO/production-data/reddit"
export AI_OS_BROWSER_HEADLESS=true
export AI_OS_API_HOST=127.0.0.1
export AI_OS_API_PORT=3001

start_api() {
  if ! pgrep -f "$REPO/apps/api/dist/index.js" >/dev/null 2>&1; then
    nice -n 15 /usr/local/bin/node "$REPO/apps/api/dist/index.js" >> "$LOG_DIR/api.supervisor.log" 2>> "$LOG_DIR/api.supervisor.error.log" &
  fi
}

start_runner() {
  if ! pgrep -f "$REPO/apps/runner/dist/index.js" >/dev/null 2>&1; then
    nice -n 15 /usr/local/bin/node "$REPO/apps/runner/dist/index.js" >> "$LOG_DIR/runner.supervisor.log" 2>> "$LOG_DIR/runner.supervisor.error.log" &
  fi
}

start_tunnel() {
  if ! pgrep -f 'aios-dominic-2026:80:127.0.0.1:3001 serveo.net' >/dev/null 2>&1; then
    nice -n 15 /usr/bin/ssh -T \
      -i /Users/joseph/.ssh/id_ed25519 \
      -o BatchMode=yes \
      -o StrictHostKeyChecking=no \
      -o UserKnownHostsFile=/Users/joseph/.ssh/known_hosts \
      -o ServerAliveInterval=30 \
      -o ServerAliveCountMax=3 \
      -o ExitOnForwardFailure=yes \
      -R aios-dominic-2026:80:127.0.0.1:3001 \
      serveo.net >> "$LOG_DIR/serveo.supervisor.log" 2>> "$LOG_DIR/serveo.supervisor.error.log" &
  fi
}

while true; do
  start_api
  start_runner
  start_tunnel
  sleep 10
done
