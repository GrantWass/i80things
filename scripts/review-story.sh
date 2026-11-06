#!/usr/bin/env bash
#
# Second-pass fact-check for one story.
#
#   npm run review -- --slug <slug>
#
# Runs the read-only i80-fact-check agent. The reviewer must end with
# "VERDICT: PASS" or the script exits non-zero. Logs go to
# .cache/fact-check/<slug>-<timestamp>.log.

set -euo pipefail

SLUG=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --slug) SLUG="${2:-}"; shift 2 ;;
    --slug=*) SLUG="${1#*=}"; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$SLUG" ]; then
  echo "Usage: npm run review -- --slug <slug>" >&2
  exit 2
fi

STORY="content/posts/${SLUG}.mdx"
if [ ! -f "$STORY" ]; then
  echo "No story at $STORY" >&2
  exit 2
fi

mkdir -p .cache/fact-check
LOG=".cache/fact-check/${SLUG}-$(date +%Y%m%d-%H%M%S).log"

echo "Fact-checking $STORY"
echo "Log: $LOG"

set +e
opencode run \
  --agent i80-fact-check \
  --model "opencode-go/muse-spark-1.3-contributor#high" \
  --auto \
  --title "Fact-check $SLUG" \
  "Review $STORY as the second-pass fact-checker. Read the story and its sources, verify the claims, and end with exactly one line: VERDICT: PASS or VERDICT: BLOCK." \
  2>&1 | tee "$LOG"
STATUS=${PIPESTATUS[0]}
set -e

if [ "$STATUS" -ne 0 ]; then
  echo "Reviewer exited $STATUS. Treating the story as blocked." >&2
  exit "$STATUS"
fi

if ! grep -q "VERDICT: PASS" "$LOG"; then
  echo "No PASS verdict in $LOG. Treating the story as blocked." >&2
  exit 1
fi

echo "Review passed."
