# Daily desk run

The daily run is an **OpenCode agent**, not a cron script that writes copy with a
template. The scheduler starts OpenCode, selects the `i80-daily` agent, and that
agent runs the reporting workflow in `AGENT.md`.

| Piece | Value |
| --- | --- |
| Agent | `i80-daily` (`.opencode/agents/i80-daily.md`) |
| Model | `opencode-go/muse-spark-1.3-contributor#high` |
| Schedule | Every day at **5:30 a.m. America/Chicago** |
| Runner | `scripts/daily-run.sh` |
| macOS job | `~/Library/LaunchAgents/com.i80things.daily.plist` |
| Logs | `.cache/daily-desk/YYYY-MM-DD.log` and `launchd.log` |
| Lock | `.cache/daily-desk.lock` (one run at a time) |

## Install

Prerequisites:

- OpenCode is installed and authenticated with access to OpenCode Go:
  ```bash
  opencode auth list
  ```
- Node 22 is available at `~/.nvm/versions/node/v22.22.3/bin` (edit the PATH in
  `scripts/daily-run.sh` and the plist if your Node path differs).
- The repo has push access to `GrantWass/i80things`.

Install the launchd job:

```bash
npm run daily:install
```

This creates the plist and bootstraps it. It does **not** run immediately.

## Run manually

```bash
npm run daily
```

Dry run — print the OpenCode command without calling the model:

```bash
DAILY_RUN_DRY=1 npm run daily
```

Draft mode — write stories as `draft: true`, do not commit or push, and leave
the files for review:

```bash
DAILY_RUN_DRAFT=1 npm run daily
```

Focus a run on a specific assignment — useful for filling city hubs or testing:

```bash
DAILY_RUN_DRAFT=1 DAILY_RUN_FOCUS="Write three evergreen stories for the empty town hubs: Seward, York, Grand Island, Lexington, Ogallala, Kimball and Hastings." npm run daily
```

Draft mode selects the separate `i80-daily-draft` agent, whose permissions deny
`git commit` and `git push`. The scheduled job uses **publish mode** by default.
Use draft mode when you want to review a story before it reaches Vercel.

Run from OpenCode's TUI instead:

```text
/daily
```

Or directly:

```bash
opencode run --agent i80-daily \
  --model opencode-go/muse-spark-1.3-contributor#high \
  --auto \
  "Run the I-80 Things daily desk for today."
```

## What the runner does

1. Creates a lock so two runs cannot overlap.
2. Pulls the latest `main` if possible.
3. Sweeps the source feeds (`npm run sources -- --hours=24`) and saves the 511
   JSON as preflight context.
4. Starts `opencode run` with the `i80-daily` agent.
5. The agent checks `npm run log` and `npm run cities:coverage`, verifies primary
   sources, writes 1–2 stories, chooses subject-matched images, adds captions
   and credits, runs `npm run images:audit`, validates and builds.
6. In publish mode it commits and pushes, then verifies the live article, the
   Instagram JPEG and the city hub. In draft mode it leaves publish-ready
   `draft: true` files and does not commit.
7. If there is no verified story, the agent skips publishing and reports why.

The agent does **not** make code changes during a news run. It reports a broken
build instead of refactoring.

## Logs and troubleshooting

```bash
npm run daily:status
tail -f .cache/daily-desk/$(date +%F).log
tail -f .cache/daily-desk/launchd.log
launchctl print gui/$(id -u)/com.i80things.daily
```

Common failures:

- **`opencode: command not found`** — the PATH in the runner/plist does not
  match the Node install. `which opencode` and update both.
- **`Insufficient account funds` or auth error** — run `opencode auth list` and
  make sure OpenCode Go is active.
- **`Operation not permitted`** — macOS is blocking Documents access for the
  background job. Either grant Full Disk Access to `/bin/bash` (System Settings →
  Privacy & Security → Full Disk Access), move the checkout outside a protected
  folder, or run `npm run daily` from a logged-in terminal. Do not disable SIP.
- **No log file** — `launchd` may not have created it yet; run
  `npm run daily` once manually first.

## Change the time

Edit `StartCalendarInterval` in
`~/Library/LaunchAgents/com.i80things.daily.plist`, then:

```bash
launchctl bootout gui/$(id -u)/com.i80things.daily
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.i80things.daily.plist
```

launchd uses the Mac's local clock. If the Mac is not on Central time, either set
the Mac to Central or change the hour in the plist.

## Uninstall

```bash
npm run daily:uninstall
```

## Cloud option

A local job is the right first step because OpenCode is already authenticated on
this Mac. For a machine that sleeps, the later cloud option is a scheduled
GitHub Actions workflow that installs OpenCode, imports an `opencode auth
export` secret, and runs the same agent. That requires storing model credentials
in GitHub and is intentionally not enabled yet.
