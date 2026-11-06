import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Brand } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Staff login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAuthed()) redirect("/admin");

  return (
    <main className="flex min-h-[70vh] items-center py-12">
      <div className="container-page">
        <div className="mx-auto max-w-sm border border-line bg-paper p-6 shadow-sm">
          <Brand />
          <h1 className="mt-6 font-serif text-2xl font-semibold">Staff desk</h1>
          <p className="mt-1 mb-5 text-[12px] leading-relaxed text-slate">
            Publish stories, add sources and grab the Instagram kit. Access is
            limited to the I-80 Things editorial team.
          </p>
          {process.env.ADMIN_PASSWORD ? (
            <LoginForm />
          ) : (
            <div className="border border-amber-dark/30 bg-amber/10 p-3">
              <p className="text-[11px] font-bold tracking-[0.08em] text-amber-dark uppercase">
                Admin is locked
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                Set <code className="bg-paper px-1">ADMIN_PASSWORD</code> in
                Vercel → Settings → Environment Variables, then redeploy. Add{" "}
                <code className="bg-paper px-1">GITHUB_TOKEN</code> too so the
                desk can commit stories and sources.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
