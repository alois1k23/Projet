import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

// Calculé à chaque requête : l'adresse publique dépend du déploiement, pas de la compilation.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = appUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/accueil", "/courriers", "/echeances", "/lettres", "/reglages", "/reinitialiser", "/connexion/verifier"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
