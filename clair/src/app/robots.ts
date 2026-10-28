import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env().CLAIR_APP_URL;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/accueil", "/courriers", "/echeances", "/lettres", "/reglages", "/reinitialiser", "/connexion/verifier"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
