import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import { INTL_LOCALE } from "@/i18n/config";
import { siteMessages } from "@/i18n/site";
import { env } from "@/lib/env";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const s = siteMessages[locale];
  return {
    metadataBase: new URL(env().CLAIR_APP_URL),
    title: { default: s.metaTitle, template: "%s · Clair" },
    description: s.metaDescription,
    applicationName: "Clair",
    appleWebApp: { capable: true, title: "Clair", statusBarStyle: "default" },
    openGraph: { type: "website", siteName: "Clair", title: s.metaTitle, description: s.metaDescription, locale: locale === "de" ? "de_CH" : "fr_CH" },
    twitter: { card: "summary_large_image", title: s.metaTitle, description: s.metaDescription },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1016" },
  ],
};

// Applique le thème avant le premier rendu pour éviter un flash.
const themeScript = `(function(){try{var t=localStorage.getItem("clair-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={INTL_LOCALE[locale]} className={`${manrope.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
