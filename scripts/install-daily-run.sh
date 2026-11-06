#!/usr/bin/env bash
#
# Install (or remove) the macOS launchd job that runs the I-80 Things daily desk
# at 5:30 a.m. Central every day.
#
#   npm run daily:install
#   npm run daily:uninstall
#
# macOS may block a background job from reading files under Documents until the
# launching binary has Full Disk Access. If runs fail with "Operation not
# permitted", grant Full Disk Access to /bin/bash (or run the job from a
# non-protected checkout) in System Settings → Privacy & Security.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LABEL="com.i80things.daily"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
UID_NUM="$(id -u)"
MODE="${1:-install}"

if [ "$MODE" = "uninstall" ]; then
  launchctl bootout "gui/$UID_NUM/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Removed $LABEL."
  exit 0
fi

mkdir -p "$HOME/Library/LaunchAgents" "$REPO/.cache/daily-desk"
chmod +x "$REPO/scripts/daily-run.sh"

cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$REPO/scripts/daily-run.sh</string>
  </array>

  <key>WorkingDirectory</key>
  <string>$REPO</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>$HOME/.nvm/versions/node/v22.22.3/bin:$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>TZ</key>
    <string>America/Chicago</string>
    <key>HOME</key>
    <string>$HOME</string>
  </dict>

  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>5</integer>
    <key>Minute</key>
    <integer>30</integer>
  </dict>

  <key>RunAtLoad</key>
  <false/>

  <key>ProcessType</key>
  <string>Background</string>

  <key>StandardOutPath</key>
  <string>$REPO/.cache/daily-desk/launchd.log</string>
  <key>StandardErrorPath</key>
  <string>$REPO/.cache/daily-desk/launchd.log</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$UID_NUM/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID_NUM" "$PLIST"
launchctl enable "gui/$UID_NUM/$LABEL"

echo "Installed $LABEL → $PLIST"
echo "Schedule: every day at 05:30 America/Chicago (launchd uses the Mac's local clock; set the Mac to Central or edit the plist)."
echo "Run now: npm run daily"
echo "Logs: $REPO/.cache/daily-desk/"
echo "Remove: npm run daily:uninstall"
