import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { brand, brandColors } from "@/lib/brand.mjs";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — Nebraska corridor news`,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: brandColors.paper,
    theme_color: brandColors.ink,
    icons: [
      {
        src: "/brand/logo-180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/brand/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
