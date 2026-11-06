import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getAllPosts } from "@/lib/content";
import { getAllSources } from "@/lib/sources";
import { githubConfigured } from "@/lib/github";
import { site } from "@/lib/site";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Staff desk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const posts = getAllPosts({ includeDrafts: true }).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    city: post.city,
    draft: Boolean(post.draft),
    featured: Boolean(post.featured),
    image: post.image,
    images: post.images.map((image) => ({
      src: image.src,
      alt: image.alt,
      credit: image.credit,
      creditUrl: image.creditUrl,
      socialSrc: image.socialSrc,
      instagram: image.instagram,
    })),
    topics: post.topics,
  }));

  const configured = {
    github: githubConfigured(),
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
    adsenseClient: Boolean(site.adsenseClient),
    adsensePubId: Boolean(site.adsensePubId),
    instagram: Boolean(process.env.IG_USER_ID && process.env.IG_ACCESS_TOKEN),
    siteUrl: site.url,
  };

  return (
    <main className="bg-cream/50">
      <AdminDashboard
        posts={posts}
        sources={getAllSources()}
        configured={configured}
      />
    </main>
  );
}
