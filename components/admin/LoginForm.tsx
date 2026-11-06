"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="kicker text-slate">Staff password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          className="mt-1.5 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink"
          placeholder="••••••••••••"
        />
      </label>
      {error ? (
        <p className="border border-alert/30 bg-alert/5 px-3 py-2 text-xs text-alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-paper uppercase transition hover:bg-highway disabled:opacity-60"
      >
        {loading ? "Checking…" : "Enter the desk"}
      </button>
    </form>
  );
}
