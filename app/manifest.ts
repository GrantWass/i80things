import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "I-80 Things — Nebraska corridor news",
    short_name: "I-80 Things",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ec",
    theme_color: "#14150f",
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
