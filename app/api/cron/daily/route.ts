import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const API = "https://api.github.com";
const REPO = process.env.GITHUB_REPO || "GrantWass/i80things";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN =
  process.env.GITHUB_DISPATCH_TOKEN || process.env.GITHUB_TOKEN || "";
const SECRET = process.env.CRON_SECRET || "";

interface WorkflowRun {
  id: number;
  event: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
}

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function github(path: string, init?: RequestInit) {
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
}

/**
 * Vercel Cron fallback for the GitHub-hosted daily desk.
 *
 * GitHub's own `schedule` trigger is best-effort and has been dropping runs.
 * This endpoint runs after the two GitHub schedule windows and only dispatches
 * a workflow when no successful or active daily-desk run exists today. It
 * never writes an article itself; the normal workflow still does the work.
 */
export async function GET(request: Request) {
  if (!SECRET) {
    return json(
      {
        error:
          "CRON_SECRET is not configured. Add it in Vercel, then let Vercel Cron call this route.",
      },
      503,
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${SECRET}`) {
    return json({ error: "Unauthorized" }, 401);
  }
  if (!TOKEN) {
    return json(
      {
        error:
          "GITHUB_DISPATCH_TOKEN or GITHUB_TOKEN is not configured. Use a token with Actions: write.",
      },
      503,
    );
  }
  if (!/^[^/]+\/[^/]+$/.test(REPO)) {
    return json({ error: "GITHUB_REPO is not a valid owner/repo." }, 503);
  }

  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();

  let runs: WorkflowRun[] = [];
  try {
    const response = await github(
      `/repos/${REPO}/actions/workflows/daily.yml/runs?created=${encodeURIComponent(startOfDay)}&per_page=30`,
    );
    if (!response.ok) {
      const detail = await response.text();
      return json(
        {
          error: `GitHub run lookup returned HTTP ${response.status}.`,
          detail: detail.slice(0, 300),
        },
        502,
      );
    }
    const data = (await response.json()) as { workflow_runs?: WorkflowRun[] };
    runs = Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
  } catch (error) {
    return json(
      {
        error: "Could not reach the GitHub API.",
        detail: error instanceof Error ? error.message : String(error),
      },
      502,
    );
  }

  const existing = runs.find(
    (run) =>
      run.status === "queued" ||
      run.status === "in_progress" ||
      run.status === "requested" ||
      run.status === "waiting" ||
      run.conclusion === "success",
  );

  if (existing) {
    return json({
      ok: true,
      action: "skipped",
      reason: "A daily-desk run already exists today.",
      run: {
        id: existing.id,
        event: existing.event,
        status: existing.status,
        conclusion: existing.conclusion,
        created_at: existing.created_at,
        url: existing.html_url,
      },
    });
  }

  try {
    const response = await github(
      `/repos/${REPO}/actions/workflows/daily.yml/dispatches`,
      {
        method: "POST",
        body: JSON.stringify({ ref: BRANCH }),
      },
    );
    if (!response.ok) {
      const detail = await response.text();
      return json(
        {
          error: `GitHub dispatch returned HTTP ${response.status}.`,
          detail: detail.slice(0, 300),
          hint: "The token needs Actions: write permission on this repository.",
        },
        502,
      );
    }
  } catch (error) {
    return json(
      {
        error: "Could not dispatch the daily desk.",
        detail: error instanceof Error ? error.message : String(error),
      },
      502,
    );
  }

  return json(
    {
      ok: true,
      action: "dispatched",
      repo: REPO,
      branch: BRANCH,
      dispatched_at: now.toISOString(),
    },
    202,
  );
}
