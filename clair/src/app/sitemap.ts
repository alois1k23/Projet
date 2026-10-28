import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { GUIDE_SLUGS, GUIDES_CHECKED_AT } from "@/content/guides";
import { SAMPLES } from "@/lib/samples";

/** Pages publiques uniquement. La langue suit le choix du visiteur (cookie ou navigateur), à la même adresse. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env().CLAIR_APP_URL;
  const pages = ["", "/exemple", "/guides", "/inscription", "/connexion", "/confidentialite", "/conditions"];
  return [
    ...pages.map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.6 })),
    ...SAMPLES.map((s) => ({ url: `${base}/exemple/${s.id}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...GUIDE_SLUGS.map((slug) => ({ url: `${base}/guides/${slug}`, lastModified: GUIDES_CHECKED_AT, changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}
