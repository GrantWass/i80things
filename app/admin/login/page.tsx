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
          <LoginForm />
          <p className="mt-4 text-[10px] leading-relaxed text-slate">
            Set <code className="bg-cream px-1">ADMIN_PASSWORD</code> in Vercel to
            enable this page. If it is blank, login is disabled by design.
          </p>
        </div>
      </div>
    </main>
  );
}
