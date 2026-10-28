import type { MetadataRoute } from "next";

/** Permet d'installer Clair sur l'écran d'accueil du téléphone. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clair — votre courrier administratif",
    short_name: "Clair",
    description: "Photographiez un courrier : Clair vous dit ce qu’il signifie, ce que vous devez faire et avant quand.",
    lang: "fr-CH",
    start_url: "/accueil",
    scope: "/",
    display: "standalone",
    background_color: "#f4f5f7",
    theme_color: "#1f4fd8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [{ name: "Ajouter un courrier", short_name: "Ajouter", url: "/courriers/nouveau", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] }],
  };
}
