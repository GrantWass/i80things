#!/usr/bin/env bash
#
# I-80 Things daily desk runner.
#
#   npm run daily                 # run now
#   DAILY_RUN_DRY=1 npm run daily # print the command without invoking the model
#
# This script is intentionally boring: preflight the sources, then hand the
# editorial run to the i80-daily OpenCode agent (Muse Spark 1.3 Contributor).
# The agent does the verification, writing and publishing. Logs live in
# .cache/daily-desk/ and are gitignored.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

export TZ="America/Chicago"
export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

STAMP="$(date +%Y-%m-%d)"
RUN_DIR="$REPO/.cache/daily-desk"
LOG="$RUN_DIR/$STAMP.log"
LOCK="$REPO/.cache/daily-desk.lock"

if [ "${DAILY_RUN_DRY:-0}" = "1" ]; then
  echo "DRY RUN: would execute:"
  printf '  opencode run --agent i80-daily --model opencode-go/muse-spark-1.3-contributor#high --auto --title %q %q\n' "I-80 daily desk $STAMP" "Run the I-80 Things daily desk for $STAMP. Follow .opencode/agents/i80-daily.md."
  exit 0
fi

mkdir -p "$RUN_DIR"

# One run at a time. mkdir is atomic on macOS; no flock required.
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "$(date -Iseconds) another daily run is already active; exiting." | tee -a "$LOG" >&2
  exit 0
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

exec >>"$LOG" 2>&1

echo ""
echo "============================================================"
echo "I-80 Things daily desk — $(date -Iseconds)"
echo "============================================================"

if ! command -v opencode >/dev/null 2>&1; then
  echo "ERROR: opencode is not on PATH. Install it or set PATH in scripts/daily-run.sh."
  exit 127
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not on PATH."
  exit 127
fi

echo "Repo: $REPO"
echo "OpenCode: $(command -v opencode) ($(opencode --version 2>/dev/null || echo 'version unknown'))"
echo "Node: $(node --version)"

# Keep the local checkout current when possible. A dirty tree or missing
# credentials is not fatal; the agent can still work with what is here.
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo ""
  echo "--- git status before run ---"
  git status --short || true
  git pull --ff-only 2>&1 || echo "WARN: git pull --ff-only failed; continuing with local checkout."
fi

echo ""
echo "--- source sweep (preflight only; the agent re-checks primary sources) ---"
npm run sources -- --hours=24 2>&1 || echo "WARN: source sweep failed."

echo ""
echo "--- Nebraska 511 (unofficial endpoint; preflight only) ---"
npm run --silent 511 -- --json > "$RUN_DIR/511-$STAMP.json" 2>>"$LOG" || echo "WARN: 511 preflight failed."

if [ "${DAILY_RUN_DRAFT:-0}" = "1" ]; then
  MODE="DRAFT MODE. Do not run git commit or git push. Write any story with draft: true
in the frontmatter, leave the files in the working tree, and report the exact
paths for human review. Do not mark anything live."
else
  MODE="PUBLISH MODE. Validate and build before committing. Commit only content,
images and source-health updates, then push."
fi

PROMPT="Run the I-80 Things daily desk for $STAMP in America/Chicago.

Follow .opencode/agents/i80-daily.md and .opencode/skills/i80-daily-post/SKILL.md.
Preflight files, if present: .cache/daily-desk/511-$STAMP.json and today's source sweep above.

Check npm run log first so you do not duplicate a story. Verify every fact with a primary source. Publish only what is confirmed, with a real licensed photo and credit. If there is no verified story, do not force one; report what you checked and why you skipped it.

$MODE

Do not wait for approval. End with the run report."

echo ""
echo "--- opencode run --agent i80-daily ---"
opencode run \
  --agent i80-daily \
  --model "opencode-go/muse-spark-1.3-contributor#high" \
  --auto \
  --title "I-80 daily desk $STAMP" \
  "$PROMPT"

echo ""
echo "Daily desk finished at $(date -Iseconds)."
