import fs from "node:fs/promises";
import path from "node:path";

const repo = process.env.GITHUB_REPO || "GrantWass/i80things";
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN || "";

const apiBase = "https://api.github.com";

export function githubConfigured(): boolean {
  return Boolean(token);
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "i80things-admin",
  };
}

async function githubFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `GitHub ${res.status}: ${detail.slice(0, 300) || res.statusText}`,
    );
  }
  return res;
}

export async function readRepoFile(
  filePath: string,
): Promise<{ content: string; sha: string } | null> {
  if (!githubConfigured()) {
    try {
      const full = path.join(/*turbopackIgnore: true*/ process.cwd(), filePath);
      const content = await fs.readFile(full, "utf8");
      return { content, sha: "" };
    } catch {
      return null;
    }
  }

  const res = await fetch(
    `${apiBase}/repos/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`,
    { headers: headers(), cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub read failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const data = (await res.json()) as { content?: string; sha?: string };
  return {
    content: Buffer.from(data.content ?? "", "base64").toString("utf8"),
    sha: data.sha ?? "",
  };
}

export async function writeRepoFile(
  filePath: string,
  content: string | Buffer,
  message: string,
): Promise<void> {
  if (!githubConfigured()) {
    if (process.env.VERCEL === "1") {
      throw new Error(
        "Publishing is not configured. Add GITHUB_TOKEN, GITHUB_REPO and GITHUB_BRANCH in Vercel.",
      );
    }
    const full = path.join(/*turbopackIgnore: true*/ process.cwd(), filePath);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content);
    return;
  }

  const existing = await githubFetch(
    `${apiBase}/repos/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`,
  )
    .then((res) => res.json() as Promise<{ sha?: string }>)
    .catch(() => null);

  const body = {
    message,
    content: (typeof content === "string" ? Buffer.from(content) : content).toString("base64"),
    branch,
    ...(existing?.sha ? { sha: existing.sha } : {}),
  };

  await githubFetch(
    `${apiBase}/repos/${repo}/contents/${encodeURIComponent(filePath)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function deleteRepoFile(
  filePath: string,
  message: string,
): Promise<void> {
  if (!githubConfigured()) {
    if (process.env.VERCEL === "1") {
      throw new Error("Publishing is not configured.");
    }
    await fs.unlink(path.join(/*turbopackIgnore: true*/ process.cwd(), filePath)).catch(() => {});
    return;
  }

  const res = await fetch(
    `${apiBase}/repos/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`,
    { headers: headers(), cache: "no-store" },
  );
  if (!res.ok) return;
  const data = (await res.json()) as { sha?: string };
  if (!data.sha) return;

  await githubFetch(
    `${apiBase}/repos/${repo}/contents/${encodeURIComponent(filePath)}`,
    {
      method: "DELETE",
      body: JSON.stringify({ message, sha: data.sha, branch }),
      headers: { "Content-Type": "application/json" },
    },
  );
}
