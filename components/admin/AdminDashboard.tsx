"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Source } from "@/lib/types";
import { places } from "@/data/places";
import { topics } from "@/data/topics";
import { sourceCategories } from "@/lib/sources";
import { formatDateShort, slugify } from "@/lib/utils";
import { Arrow } from "@/components/Icon";

type AdminPost = {
  slug: string;
  title: string;
  date: string;
  city: string;
  draft: boolean;
  featured: boolean;
  image?: string;
  topics: string[];
};

type Configured = {
  github: boolean;
  adminPassword: boolean;
  adsenseClient: boolean;
  adsensePubId: boolean;
  instagram: boolean;
  siteUrl: string;
};

type PublishResult = {
  slug: string;
  url: string;
  socialImage: string;
  caption: string;
};

const inputClass =
  "mt-1 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink";
const labelClass = "block text-[10px] font-bold tracking-[0.1em] text-slate uppercase";

function localNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data as T;
}

const emptySourceForm = {
  name: "",
  category: "news",
  kind: "rss",
  url: "",
  feedUrl: "",
  apiUrl: "",
  coverage: "",
  city: "",
  mileMarker: "",
  access: "free",
  reliability: "news",
  recommended: false,
  notes: "",
  tags: "",
};

export function AdminDashboard({
  posts,
  sources,
  configured,
}: {
  posts: AdminPost[];
  sources: Source[];
  configured: Configured;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"compose" | "stories" | "sources" | "social" | "setup">("compose");
  const [message, setMessage] = useState("");

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div>
      <div className="bg-ink text-paper">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <span className="sign-green flex h-8 w-9 flex-col items-center justify-center text-paper">
              <span className="text-[6px] font-bold tracking-widest">INTERSTATE</span>
              <span className="font-serif text-lg leading-none font-bold">80</span>
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase">Staff desk</p>
              <p className="text-[10px] text-cream/60">
                {configured.github ? "GitHub publishing connected" : "Local mode — no GitHub token"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="border border-cream/30 px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] uppercase hover:border-paper">
              View site
            </Link>
            <button onClick={logout} className="border border-cream/30 px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] uppercase hover:border-paper">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-paper">
        <div className="container-page no-scrollbar flex gap-1 overflow-x-auto py-2">
          {([
            ["compose", "New story"],
            ["stories", `Stories (${posts.length})`],
            ["sources", `Sources (${sources.length})`],
            ["social", "Instagram kit"],
            ["setup", "Setup"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setTab(id); setMessage(""); }}
              className={`shrink-0 border px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase transition ${
                tab === id ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-page py-6">
        {message ? (
          <div className="mb-4 border border-highway/30 bg-highway/5 px-4 py-2.5 text-xs font-medium text-highway">
            {message}
          </div>
        ) : null}

        {tab === "compose" ? (
          <ComposeForm
            configured={configured}
            onDone={(msg) => { setMessage(msg); router.refresh(); }}
          />
        ) : null}
        {tab === "stories" ? <StoriesList posts={posts} /> : null}
        {tab === "sources" ? (
          <SourcesManager
            sources={sources}
            onDone={(msg) => { setMessage(msg); router.refresh(); }}
          />
        ) : null}
        {tab === "social" ? <SocialKit posts={posts} siteUrl={configured.siteUrl} /> : null}
        {tab === "setup" ? <Setup configured={configured} /> : null}
      </div>
    </div>
  );
}

function ComposeForm({
  configured,
  onDone,
}: {
  configured: Configured;
  onDone: (message: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [dek, setDek] = useState("");
  const [body, setBody] = useState("");
  const [city, setCity] = useState("statewide");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["crashes"]);
  const [tags, setTags] = useState("");
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState(localNow());
  const [featured, setFeatured] = useState(false);
  const [draft, setDraft] = useState(false);
  const [image, setImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCredit, setImageCredit] = useState("");
  const [imageCreditUrl, setImageCreditUrl] = useState("");
  const [instagramCaption, setInstagramCaption] = useState("");
  const [sourceRows, setSourceRows] = useState([{ name: "", url: "" }]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PublishResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function toggleTopic(slug: string) {
    setSelectedTopics((current) =>
      current.includes(slug) ? current.filter((t) => t !== slug) : [...current, slug],
    );
  }

  function reset() {
    setTitle("");
    setDek("");
    setBody("");
    setCity("statewide");
    setSelectedTopics(["crashes"]);
    setTags("");
    setSummary("");
    setDate(localNow());
    setFeatured(false);
    setDraft(false);
    setImage("");
    setImageAlt("");
    setImageCredit("");
    setImageCreditUrl("");
    setInstagramCaption("");
    setSourceRows([{ name: "", url: "" }]);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  }

  async function uploadIfNeeded(): Promise<string> {
    if (!file) return image;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the image."));
      reader.readAsDataURL(file);
    });
    const uploaded = await postJson<{ path: string }>("/api/admin/upload", {
      dataUrl,
      filename: file.name,
      slug: slugify(title) || "post",
    });
    setImage(uploaded.path);
    return uploaded.path;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (title.trim().length < 8) throw new Error("Add a longer headline.");
      if (!dek.trim()) throw new Error("Add a dek.");
      if (body.trim().length < 200) throw new Error("The story body must be at least 200 characters.");
      const uploadedPath = await uploadIfNeeded();
      const created = await postJson<PublishResult>("/api/admin/posts", {
        title,
        dek,
        body,
        city,
        topics: selectedTopics,
        tags,
        summary,
        date: new Date(date).toISOString(),
        featured,
        draft,
        image: uploadedPath,
        imageAlt,
        imageCredit,
        imageCreditUrl,
        instagramCaption,
        sources: sourceRows.filter((row) => row.name.trim() && row.url.trim()),
      });
      setResult(created);
      onDone(
        configured.github
          ? "Committed to GitHub. Vercel is rebuilding — the story is live in about a minute."
          : "Saved locally. In production, configure GITHUB_TOKEN so Vercel can rebuild.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish.");
    } finally {
      setSaving(false);
    }
  }

  async function copyCaption() {
    if (!result) return;
    try {
      const data = await fetch(result.caption).then((r) => r.json() as Promise<{ caption: string }>);
      await navigator.clipboard.writeText(data.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl border border-highway/30 bg-paper p-6">
        <p className="kicker text-highway">Story queued</p>
        <h2 className="mt-1 font-serif text-3xl font-semibold">Published to the repo.</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          {configured.github
            ? "Vercel is rebuilding. The URL below goes live when the deployment finishes — usually under two minutes."
            : "This was written to the local filesystem. Commit and push to deploy."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="bg-ink px-4 py-2 text-[10px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway">
            Open story
          </a>
          <a href={result.socialImage} target="_blank" rel="noopener noreferrer" className="border border-ink px-4 py-2 text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-cream">
            Instagram image (JPEG)
          </a>
          <button onClick={copyCaption} className="border border-line px-4 py-2 text-[10px] font-bold tracking-[0.1em] uppercase hover:border-ink">
            {copied ? "Caption copied" : "Copy IG caption"}
          </button>
        </div>
        <div className="mt-6 border border-line bg-cream p-3">
          <p className="kicker text-slate">Social image preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.socialImage} alt="Instagram preview" className="mt-2 max-h-[26rem] w-auto border border-line" />
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={reset} className="bg-ink px-4 py-2 text-[10px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway">
            Write another
          </button>
          <a href="/admin" className="border border-line px-4 py-2 text-[10px] font-bold tracking-[0.1em] uppercase hover:border-ink">
            Back to desk
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_21rem]">
      <div className="space-y-4">
        <div className="border border-line bg-paper p-5">
          <h2 className="font-serif text-2xl font-semibold">Write the story</h2>
          <p className="mt-1 text-[12px] text-slate">
            Markdown works. Lead with the confirmed fact, then context. Add a
            &ldquo;short version&rdquo; box and primary sources — both are required
            for quality.
          </p>

          <label className="mt-4 block">
            <span className={labelClass}>Headline</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="I-80 westbound reopens near Kearney after crash" />
          </label>
          <p className="mt-1 text-[10px] text-slate">
            URL: /news/{slugify(title) || "your-headline"}
          </p>

          <label className="mt-3 block">
            <span className={labelClass}>Dek — one sentence that adds information</span>
            <textarea value={dek} onChange={(e) => setDek(e.target.value)} required rows={2} className={inputClass} placeholder="The closure lasted about 90 minutes. No serious injuries were reported." />
          </label>

          <label className="mt-3 block">
            <span className={labelClass}>Body (Markdown)</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={18} className={`${inputClass} font-mono text-[13px] leading-relaxed`} placeholder={`What happened, confirmed by the agency.

## What we know

- Location: I-80 westbound near mile 272
- Time: about 7:10 a.m.
- Status: reopened at 8:40 a.m., per NSP

## Why it matters

Context for drivers...

## What happens next

...`} />
          </label>
          <p className="mt-1 text-[10px] text-slate">
            Use `##` for section headings. Link primary sources inline and again
            in the source rows on the right.
          </p>
        </div>

        <div className="border border-line bg-paper p-5">
          <h2 className="font-serif text-xl font-semibold">The short version</h2>
          <p className="mt-1 text-[12px] text-slate">
            One fact per line, 3–5 bullets. These appear in the amber box and are
            what AI search engines quote.
          </p>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className={`${inputClass} text-[13px]`}
            placeholder={"I-80 westbound was closed near mile 272 for about 90 minutes.\nThe State Patrol confirmed two vehicles were involved.\nNo serious injuries were reported."}
          />
        </div>

        <div className="border border-line bg-paper p-5">
          <h2 className="font-serif text-xl font-semibold">Sources</h2>
          <p className="mt-1 text-[12px] text-slate">
            Name the agency or outlet and paste the exact URL. At least one
            primary source is expected on every story.
          </p>
          <div className="mt-3 space-y-2">
            {sourceRows.map((row, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                <input
                  value={row.name}
                  onChange={(e) => setSourceRows((rows) => rows.map((r, i) => i === index ? { ...r, name: e.target.value } : r))}
                  className="border border-line bg-paper px-2.5 py-2 text-xs outline-none focus:border-ink"
                  placeholder="Nebraska State Patrol"
                />
                <input
                  value={row.url}
                  onChange={(e) => setSourceRows((rows) => rows.map((r, i) => i === index ? { ...r, url: e.target.value } : r))}
                  className="border border-line bg-paper px-2.5 py-2 text-xs outline-none focus:border-ink"
                  placeholder="https://…"
                  type="url"
                />
                <button
                  type="button"
                  onClick={() => setSourceRows((rows) => rows.length === 1 ? rows : rows.filter((_, i) => i !== index))}
                  className="border border-line px-2 text-[10px] font-bold tracking-wide text-slate uppercase hover:border-ink"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSourceRows((rows) => [...rows, { name: "", url: "" }])}
            className="mt-2 text-[10px] font-bold tracking-[0.08em] text-highway uppercase underline decoration-amber underline-offset-4"
          >
            + Add another source
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="border border-ink bg-paper p-5">
          <h2 className="font-serif text-xl font-semibold">Publish</h2>
          <label className="mt-3 block">
            <span className={labelClass}>Publication time</span>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </label>
          <label className="mt-3 flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[#14432f]" />
            Feature on the homepage
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} className="h-4 w-4 accent-[#14432f]" />
            Save as draft (not public)
          </label>
          {error ? <p className="mt-3 border border-alert/30 bg-alert/5 px-2.5 py-2 text-[11px] text-alert">{error}</p> : null}
          <button type="submit" disabled={saving} className="mt-4 w-full bg-ink px-4 py-3 text-[10px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway disabled:opacity-60">
            {saving ? "Publishing…" : draft ? "Save draft" : "Publish story"}
          </button>
          <p className="mt-2 text-center text-[9px] text-slate">
            {configured.github ? "Commits to GitHub → Vercel rebuild" : "Local mode"}
          </p>
        </div>

        <div className="border border-line bg-paper p-5">
          <h2 className="font-serif text-xl font-semibold">Place & topics</h2>
          <label className="mt-3 block">
            <span className={labelClass}>Town hub</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
              <option value="statewide">Statewide / corridor</option>
              {places.map((place) => (
                <option key={place.slug} value={place.slug}>{place.name} — MM {place.mileMarker}</option>
              ))}
            </select>
          </label>
          <fieldset className="mt-3">
            <legend className={labelClass}>Topics</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {topics.map((topic) => (
                <label key={topic.slug} className="flex items-center gap-1.5 text-[11px]">
                  <input type="checkbox" checked={selectedTopics.includes(topic.slug)} onChange={() => toggleTopic(topic.slug)} className="h-3.5 w-3.5 accent-[#14432f]" />
                  {topic.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="mt-3 block">
            <span className={labelClass}>Tags (comma-separated)</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="kearney, closure, state patrol" />
          </label>
        </div>

        <div className="border border-line bg-paper p-5">
          <h2 className="font-serif text-xl font-semibold">Image</h2>
          <p className="mt-1 text-[11px] text-slate">
            Upload a photo you have rights to, or leave blank and we generate a
            branded graphic. Instagram images are generated automatically.
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-3 block w-full text-[11px] file:mr-2 file:border file:border-line file:bg-cream file:px-2 file:py-1.5 file:text-[10px] file:font-bold file:uppercase"
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Upload preview" className="mt-2 aspect-[16/9] w-full border border-line object-cover" />
          ) : null}
          <label className="mt-2 block">
            <span className={labelClass}>Alt text / caption</span>
            <input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} className={inputClass} placeholder="I-80 westbound near Kearney" />
          </label>
          <label className="mt-2 block">
            <span className={labelClass}>Credit</span>
            <input value={imageCredit} onChange={(e) => setImageCredit(e.target.value)} className={inputClass} placeholder="Photo: Nebraska State Patrol" />
          </label>
          <label className="mt-2 block">
            <span className={labelClass}>Credit URL</span>
            <input value={imageCreditUrl} onChange={(e) => setImageCreditUrl(e.target.value)} className={inputClass} placeholder="https://…" />
          </label>
        </div>

        <div className="border border-line bg-paper p-5">
          <h2 className="font-serif text-xl font-semibold">Instagram caption</h2>
          <p className="mt-1 text-[11px] text-slate">
            Leave blank to auto-write one from the headline, dek, town and link.
          </p>
          <textarea
            value={instagramCaption}
            onChange={(e) => setInstagramCaption(e.target.value)}
            rows={5}
            className={`${inputClass} text-[12px]`}
            placeholder="Auto-generated if blank"
          />
        </div>
      </aside>
    </form>
  );
}

function StoriesList({ posts }: { posts: AdminPost[] }) {
  return (
    <div className="border border-line bg-paper">
      <div className="border-b border-line px-4 py-3">
        <h2 className="font-serif text-xl font-semibold">All stories</h2>
        <p className="text-[11px] text-slate">
          {posts.filter((p) => p.draft).length} drafts · {posts.length} total.
          New posts appear here after the Vercel rebuild.
        </p>
      </div>
      <ul className="divide-y divide-line">
        {posts.map((post) => (
          <li key={post.slug} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-[16rem] flex-1">
              <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-wide text-slate uppercase">
                {formatDateShort(post.date)} · {post.city}
                {post.draft ? <span className="bg-amber px-1.5 py-0.5 text-[9px] text-ink">Draft</span> : null}
                {post.featured ? <span className="border border-line px-1.5 py-0.5 text-[9px]">Featured</span> : null}
              </p>
              <Link href={`/news/${post.slug}`} target="_blank" className="font-serif text-base font-semibold hover:underline hover:decoration-amber">
                {post.title}
              </Link>
            </div>
            <div className="flex gap-2">
              <a href={`/api/social/${post.slug}`} target="_blank" className="border border-line px-2.5 py-1.5 text-[9px] font-bold tracking-wide uppercase hover:border-ink">
                IG image
              </a>
              <a href={`/news/${post.slug}`} target="_blank" className="border border-line px-2.5 py-1.5 text-[9px] font-bold tracking-wide uppercase hover:border-ink">
                View
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourcesManager({
  sources,
  onDone,
}: {
  sources: Source[];
  onDone: (message: string) => void;
}) {
  const [form, setForm] = useState({ ...emptySourceForm });
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter((s) =>
      [s.name, s.coverage, s.city, s.tags?.join(" "), s.category].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [sources, query]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await postJson<{ count: number; updated: boolean }>("/api/admin/sources", form);
      onDone(`${data.updated ? "Updated" : "Added"} source. ${data.count} total. Vercel will rebuild to publish it.`);
      setForm({ ...emptySourceForm });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Remove "${name}" from the source directory?`)) return;
    try {
      const data = await postJson<{ count: number }>("/api/admin/sources", { deleteId: id });
      onDone(`Removed ${name}. ${data.count} sources remain.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_23rem]">
      <div className="border border-line bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <div>
            <h2 className="font-serif text-xl font-semibold">Source directory</h2>
            <p className="text-[11px] text-slate">{sources.length} feeds and links</p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter sources…"
            className="border border-line bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-ink"
          />
        </div>
        <ul className="max-h-[38rem] divide-y divide-line overflow-y-auto">
          {filtered.map((source) => (
            <li key={source.id} className="flex items-start gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{source.name}</p>
                <p className="truncate text-[10px] text-slate">
                  {source.category} · {source.kind} · {source.access}
                  {source.city ? ` · ${source.city}` : ""}
                </p>
              </div>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold tracking-wide text-highway uppercase hover:text-amber-dark">
                Open
              </a>
              <button onClick={() => remove(source.id, source.name)} className="text-[9px] font-bold tracking-wide text-slate uppercase hover:text-alert">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={submit} className="border border-line bg-paper p-5">
        <h2 className="font-serif text-xl font-semibold">Add a source</h2>
        <p className="mt-1 text-[11px] text-slate">
          Test the URL first. If it is a feed, verify it returns RSS/Atom, not
          HTML.
        </p>

        <label className="mt-3 block">
          <span className={labelClass}>Name</span>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Kearney Hub" />
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block">
            <span className={labelClass}>Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
              {sourceCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Kind</span>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={inputClass}>
              {["rss", "web", "api", "scanner", "social"].map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-2 block">
          <span className={labelClass}>URL</span>
          <input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} placeholder="https://…" />
        </label>
        <label className="mt-2 block">
          <span className={labelClass}>RSS / feed URL (optional)</span>
          <input type="url" value={form.feedUrl} onChange={(e) => setForm({ ...form, feedUrl: e.target.value })} className={inputClass} placeholder="https://…/feed/" />
        </label>
        <label className="mt-2 block">
          <span className={labelClass}>API URL (optional)</span>
          <input type="url" value={form.apiUrl} onChange={(e) => setForm({ ...form, apiUrl: e.target.value })} className={inputClass} placeholder="https://…" />
        </label>
        <label className="mt-2 block">
          <span className={labelClass}>Coverage</span>
          <input value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} className={inputClass} placeholder="Kearney & Buffalo County" />
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block">
            <span className={labelClass}>City slug</span>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="kearney" />
          </label>
          <label className="block">
            <span className={labelClass}>Mile marker</span>
            <input value={form.mileMarker} onChange={(e) => setForm({ ...form, mileMarker: e.target.value })} className={inputClass} placeholder="272–281" />
          </label>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block">
            <span className={labelClass}>Access</span>
            <select value={form.access} onChange={(e) => setForm({ ...form, access: e.target.value })} className={inputClass}>
              {["free", "free-account", "metered", "paid", "view-only"].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Reliability</span>
            <select value={form.reliability} onChange={(e) => setForm({ ...form, reliability: e.target.value })} className={inputClass}>
              {["official", "news", "community", "data"].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-2 block">
          <span className={labelClass}>Notes</span>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} placeholder="What it covers, paywall, bot protection, caveats." />
        </label>
        <label className="mt-2 block">
          <span className={labelClass}>Tags (comma-separated)</span>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="newspaper, Kearney, RSS" />
        </label>
        <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold">
          <input type="checkbox" checked={form.recommended} onChange={(e) => setForm({ ...form, recommended: e.target.checked })} className="h-3.5 w-3.5 accent-[#14432f]" />
          Mark as a recommended source
        </label>
        {error ? <p className="mt-3 border border-alert/30 bg-alert/5 px-2.5 py-2 text-[11px] text-alert">{error}</p> : null}
        <button type="submit" disabled={saving} className="mt-3 w-full bg-ink px-4 py-2.5 text-[10px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway disabled:opacity-60">
          {saving ? "Saving…" : "Save source"}
        </button>
      </form>
    </div>
  );
}

function SocialKit({ posts, siteUrl }: { posts: AdminPost[]; siteUrl: string }) {
  const [slug, setSlug] = useState(posts.find((p) => !p.draft)?.slug ?? posts[0]?.slug ?? "");
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    fetch(`/api/social/${slug}/caption`)
      .then((r) => r.json() as Promise<{ caption?: string }>)
      .then((data) => { if (active) setCaption(data.caption ?? ""); })
      .catch(() => {});
    return () => { active = false; };
  }, [slug]);

  const post = posts.find((p) => p.slug === slug);

  async function copy() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${siteUrl}/news/${slug}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {}
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
      <div className="border border-line bg-paper p-5">
        <h2 className="font-serif text-xl font-semibold">Instagram kit</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-slate">
          Pick a story. The image is a 1080×1350 JPEG. If the story has a real
          photo, it is the full-bleed background; otherwise you get a branded
          text card. Captions end with &ldquo;Full story → link in bio.&rdquo;
        </p>
        <label className="mt-3 block">
          <span className={labelClass}>Story</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass}>
            {posts.map((p) => (
              <option key={p.slug} value={p.slug}>{p.draft ? "[Draft] " : ""}{p.title}</option>
            ))}
          </select>
        </label>

        {post && !post.image ? (
          <div className="mt-3 border border-amber-dark/30 bg-amber/10 p-3">
            <p className="text-[10px] font-bold tracking-[0.08em] text-amber-dark uppercase">
              No real photo attached
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
              This story will use the branded text card. For a stronger post,
              edit the story and upload a photo you have rights to. Do not use
              AI-generated images of real events.
            </p>
          </div>
        ) : null}

        {slug ? (
          <>
            <div className="mt-4 border border-line bg-cream p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/social/${slug}`} alt="Instagram image preview" className="w-full border border-line" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={copy} className="bg-ink px-3 py-2 text-[10px] font-bold tracking-[0.08em] text-paper uppercase hover:bg-highway">
                {copied ? "Copied" : "Copy caption"}
              </button>
              <a href={`/api/social/${slug}`} download={`${slug}.jpg`} className="border border-ink px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase hover:bg-cream">
                Download image
              </a>
              <a href={post ? `/news/${slug}` : "#"} target="_blank" className="border border-line px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase hover:border-ink">
                Story
              </a>
              <button onClick={copyLink} className="border border-line px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase hover:border-ink">
                {copiedLink ? "Bio link copied" : "Copy bio link"}
              </button>
            </div>
            <p className="mt-3 border border-line bg-cream p-2 text-[10px] leading-relaxed text-slate">
              Instagram captions cannot be clicked. Put this link in your bio
              before posting: <code className="break-all">{siteUrl}/news/{slug}</code>
            </p>
            <a href="https://www.instagram.com/" target="_blank" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.08em] text-highway uppercase hover:text-amber-dark">
              Open Instagram <Arrow className="h-3 w-3" />
            </a>
            <p className="mt-3 border-t border-line pt-3 text-[10px] leading-relaxed text-slate">
              Public JPEG for the Meta API: <code className="break-all">{siteUrl}/api/social/{slug}</code>
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate">No stories yet.</p>
        )}
      </div>

      <div className="border border-line bg-paper p-5">
        <h2 className="font-serif text-xl font-semibold">Caption</h2>
        <p className="mt-1 text-[11px] text-slate">
          Catchy hook first, then the headline and context, then
          &ldquo;Full story → link in bio.&rdquo; 3–5 hashtags. Edit before
          posting; Meta caps captions at 2,200 characters.
        </p>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={18}
          className={`${inputClass} text-[13px] leading-relaxed`}
        />
        <p className="mt-1 text-right text-[10px] text-slate">{caption.length}/2200</p>
        <div className="mt-4 border-t border-line pt-3">
          <h3 className="kicker text-slate">Posting checklist</h3>
          <ol className="mt-2 space-y-1.5 text-[12px] text-ink-soft">
            <li>1. Confirm the story is live at the public URL.</li>
            <li>2. Put the story link in your Instagram bio.</li>
            <li>3. Download the 4:5 JPEG above.</li>
            <li>4. Paste the caption — it ends with &ldquo;link in bio.&rdquo;</li>
            <li>5. Post, then pin a comment naming the primary source.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Setup({ configured }: { configured: Configured }) {
  const items = [
    {
      label: "GitHub publishing",
      ok: configured.github,
      body: "GITHUB_TOKEN (fine-grained, Contents read/write), GITHUB_REPO, GITHUB_BRANCH. Without it, the admin can only save to the local filesystem.",
    },
    {
      label: "Admin password",
      ok: configured.adminPassword,
      body: "ADMIN_PASSWORD. Use a long random string. Optional ADMIN_SECRET for session signing.",
    },
    {
      label: "AdSense client",
      ok: configured.adsenseClient,
      body: "NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-…). Add NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD, _IN_ARTICLE and _SIDEBAR for manual units.",
    },
    {
      label: "ads.txt publisher ID",
      ok: configured.adsensePubId,
      body: "ADSENSE_PUB_ID (pub-…). Served at /ads.txt. Required for healthy AdSense revenue.",
    },
    {
      label: "Instagram API",
      ok: configured.instagram,
      body: "IG_USER_ID + IG_ACCESS_TOKEN. Optional; the manual kit works without it. Requires a Business account, linked Facebook Page and instagram_content_publish.",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="border border-line bg-paper p-5">
        <h2 className="font-serif text-xl font-semibold">Deployment checklist</h2>
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.label} className="flex gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.ok ? "bg-emerald-600" : "bg-amber"}`} />
              <div>
                <p className="text-[12px] font-bold">
                  {item.label} <span className="font-normal text-slate">— {item.ok ? "configured" : "not set"}</span>
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-6">
        <div className="border border-line bg-paper p-5">
          <h2 className="font-serif text-xl font-semibold">The daily agent</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-slate">
            The full system prompt lives in <code className="bg-cream px-1">AGENT.md</code>.
            The agent should run these before writing:
          </p>
          <pre className="mt-3 overflow-x-auto border border-line bg-ink p-3 text-[11px] leading-relaxed text-cream">npm run log        # what we already published
npm run sources    # fresh headlines + NWS alerts
npm run new        # scaffold a draft
npm run validate   # check frontmatter</pre>
          <p className="mt-2 text-[11px] text-slate">
            Every post must name a primary source, include a short-version box
            and be safe to share on Instagram.
          </p>
        </div>

        <div className="border border-line bg-paper p-5">
          <h2 className="font-serif text-xl font-semibold">AdSense in 5 steps</h2>
          <ol className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-ink-soft">
            <li>1. Deploy with at least 15 original stories and the About / Contact / Privacy pages.</li>
            <li>2. Apply at adsense.google.com, add the site, paste the verification snippet (env var).</li>
            <li>3. Set ADSENSE_PUB_ID so /ads.txt is valid.</li>
            <li>4. Configure Google&apos;s CMP under Privacy &amp; messaging for EEA/UK consent.</li>
            <li>5. Turn on Auto ads conservatively, keep the manual slots, and watch CLS.</li>
          </ol>
          <p className="mt-2 text-[11px] text-slate">
            Approval is judged on originality and transparency, not volume. Do not
            pad the site with thin aggregated posts.
          </p>
        </div>
      </div>
    </div>
  );
}
