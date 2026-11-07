#!/usr/bin/env bash
#
# I-80 Things daily desk preflight: one command, one dated bundle.
#
#   bash scripts/preflight.sh           # run both sweeps into today's bundle
#   bash scripts/preflight.sh --reuse   # reuse today's bundle if it exists
#   bash scripts/preflight.sh --dry-run # write meta.json only; no network
#
# The bundle is .cache/daily-desk/<STAMP>/ with sources.txt (the sweep
# output), 511.json (the JSON payload) and meta.json (stamp, startedAt,
# finishedAt, sources: ok|failed, five11: ok|failed).
#
# Stdout carries only the absolute bundle path as its last line, so callers
# can capture it: BUNDLE_DIR="$(bash scripts/preflight.sh --reuse)".
# Everything else goes to stderr. A failed sweep is recorded in meta.json
# and is not fatal (exit 0), because the runner treats preflight failure
# as a warning.
#
# This script is intentionally boring: no retries, no parallel fetching.
# It calls check-sources and check-511 through npm run exactly as the
# runner and workflow did.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

# Same stamp source as scripts/daily-run.sh.
export TZ="America/Chicago"
STAMP="$(date +%Y-%m-%d)"
BUNDLE_DIR="$REPO/.cache/daily-desk/$STAMP"

REUSE=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --reuse) REUSE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    *)
      echo "preflight: unknown argument: $arg (expected --reuse or --dry-run)" >&2
      exit 2
      ;;
  esac
done

if [ "$REUSE" = "1" ] && [ -f "$BUNDLE_DIR/meta.json" ]; then
  echo "preflight: reusing bundle for $STAMP" >&2
  echo "$BUNDLE_DIR"
  exit 0
fi

mkdir -p "$BUNDLE_DIR"

STARTED_AT="$(date -Iseconds)"
SOURCES_STATUS="failed"
FIVE11_STATUS="failed"

if [ "$DRY_RUN" = "1" ]; then
  echo "preflight: dry run for $STAMP; writing meta.json only (no network)" >&2
  SOURCES_STATUS="skipped"
  FIVE11_STATUS="skipped"
else
  echo "preflight: sweeping sources for $STAMP" >&2
  if npm run sources -- --hours=24 >"$BUNDLE_DIR/sources.txt" 2>&1; then
    SOURCES_STATUS="ok"
  else
    echo "preflight: source sweep failed; recorded in meta.json" >&2
  fi

  echo "preflight: checking Nebraska 511 for $STAMP" >&2
  if npm run --silent 511 -- --json >"$BUNDLE_DIR/511.json"; then
    FIVE11_STATUS="ok"
  else
    echo "preflight: 511 check failed; recorded in meta.json" >&2
  fi
fi

FINISHED_AT="$(date -Iseconds)"

printf '{"stamp": "%s", "startedAt": "%s", "finishedAt": "%s", "sources": "%s", "five11": "%s"}\n' \
  "$STAMP" "$STARTED_AT" "$FINISHED_AT" "$SOURCES_STATUS" "$FIVE11_STATUS" \
  >"$BUNDLE_DIR/meta.json"

echo "$BUNDLE_DIR"
exit 0
