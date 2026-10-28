export const LOCALES = ["fr", "de", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "clair-lang";

export const LOCALE_NAMES: Record<Locale, string> = { fr: "Français", de: "Deutsch", en: "English" };
/** Langue utilisée pour les formats de date (les montants suivent toujours la convention suisse 1’240.50). */
export const INTL_LOCALE: Record<Locale, string> = { fr: "fr-CH", de: "de-CH", en: "en-CH" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Choisit la langue à partir de l'en-tête Accept-Language du navigateur. */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: (tag ?? "").toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .filter((x) => x.lang && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) if (isLocale(lang)) return lang;
  return DEFAULT_LOCALE;
}
