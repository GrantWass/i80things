#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LABEL="com.i80things.daily"
LOG_DIR="$REPO/.cache/daily-desk"

echo "I-80 daily desk status"
echo "----------------------"
echo "Repo: $REPO"

if launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1; then
  echo "launchd: installed"
  launchctl print "gui/$(id -u)/$LABEL" 2>/dev/null | grep -E "state =|last exit code|runs =" | sed 's/^[[:space:]]*/  /' || true
else
  echo "launchd: not installed (run npm run daily:install)"
fi

echo "Schedule: 05:30 America/Chicago (launchd uses the Mac clock)"
echo "Logs: $LOG_DIR"

LATEST="$(ls -1t "$LOG_DIR"/*.log 2>/dev/null | head -1 || true)"
if [ -n "$LATEST" ]; then
  echo ""
  echo "Latest log: $LATEST"
  echo "Last lines:"
  tail -20 "$LATEST" | sed 's/^/  /'
else
  echo "No runs logged yet."
fi
