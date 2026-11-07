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

# Use the repo's pre-commit checks in both local and cloud runs.
git config core.hooksPath .githooks 2>/dev/null || true

export TZ="America/Chicago"
export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

STAMP="$(date +%Y-%m-%d)"
RUN_DIR="$REPO/.cache/daily-desk"
LOG="$RUN_DIR/$STAMP.log"
LOCK="$REPO/.cache/daily-desk.lock"

if [ "${DAILY_RUN_DRY:-0}" = "1" ]; then
  AGENT="i80-daily"
  [ "${DAILY_RUN_DRAFT:-0}" = "1" ] && AGENT="i80-daily-draft"
  echo "DRY RUN: would execute:"
  printf '  opencode run --agent %s --model opencode-go/muse-spark-1.3-contributor#high --auto --title %q %q\n' "$AGENT" "I-80 daily desk $STAMP" "Run the I-80 Things daily desk for $STAMP. Follow .opencode/agents/$AGENT.md."
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
echo "--- preflight bundle (sweeps already ran; the agent verifies primary sources) ---"
BUNDLE_DIR=""
if BUNDLE_DIR="$(bash "$REPO/scripts/preflight.sh" --reuse)"; then
  echo "Preflight bundle: $BUNDLE_DIR"
else
  echo "WARN: preflight failed."
  BUNDLE_DIR="$RUN_DIR/$STAMP"
fi
if [ -f "$BUNDLE_DIR/meta.json" ]; then
  grep -q '"sources": "failed"' "$BUNDLE_DIR/meta.json" 2>/dev/null && echo "WARN: source sweep failed." || true
  grep -q '"five11": "failed"' "$BUNDLE_DIR/meta.json" 2>/dev/null && echo "WARN: 511 preflight failed." || true
fi
export DAILY_BUNDLE="$BUNDLE_DIR"

if [ "${DAILY_RUN_DRAFT:-0}" = "1" ]; then
  AGENT="i80-daily-draft"
  MODE="DRAFT MODE. Do not run git commit or git push. Write any story with draft: true
in the frontmatter, but make it publish-ready: validate, images:audit and build
must pass. Leave the files in the working tree and report the exact paths for
human review. Do not mark anything live."
else
  AGENT="i80-daily"
  MODE="PUBLISH MODE. Run validate, images:audit, factcheck --publish and build
before committing. Run review --slug for each new story; a VERDICT: BLOCK must
be fixed and re-reviewed. Do not leave draft:true. Commit content, images and
source-health updates, push, then verify the live article, Instagram JPEG and
city hub."
fi

FOCUS="${DAILY_RUN_FOCUS:-}"
if [ -n "$FOCUS" ]; then
  FOCUS="FOCUS FOR THIS RUN: $FOCUS"
fi

PROMPT="Run the I-80 Things daily desk for $STAMP in America/Chicago.

Follow .opencode/agents/$AGENT.md and .opencode/skills/i80-daily-post/SKILL.md.
Preflight bundle: $BUNDLE_DIR (sources.txt, 511.json, meta.json). The source and
511 sweeps already ran — read the bundle; do not re-sweep the feeds with
npm run sources or npm run 511. Verify every fact against a primary source yourself.

Check npm run log, npm run cities:coverage and npm run stories:audit -- --due first. Do not duplicate a story. If a story is due and its facts changed, update it instead of writing a new one; set updated and add a correction note for substantive changes. If there is no safety/weather story, prefer a city hub with zero local stories. Verify every fact with a primary source. Choose strong, subject-matched images (1–3 when useful), add captions/credits, and run npm run images:audit. Do not put one-day advisories or undated current conditions in evergreen copy. If there is no verified story, do not force one; report what you checked and why you skipped it.

$MODE

$FOCUS

Do not wait for approval. End with the run report."

echo ""
echo "--- opencode run --agent $AGENT ---"
set +e
opencode run \
  --agent "$AGENT" \
  --model "opencode-go/muse-spark-1.3-contributor#high" \
  --auto \
  --title "I-80 daily desk $STAMP" \
  "$PROMPT"
RUN_STATUS=$?

echo ""
echo "OpenCode exit status: $RUN_STATUS"
echo "Daily desk finished at $(date -Iseconds)."

if [ "$RUN_STATUS" -ne 0 ]; then
  exit "$RUN_STATUS"
fi
