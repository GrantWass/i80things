import { site } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const pubId = site.adsensePubId;
  const body = pubId
    ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0
`
    : `# AdSense publisher ID is not configured yet.
# Set ADSENSE_PUB_ID in Vercel, then redeploy.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
