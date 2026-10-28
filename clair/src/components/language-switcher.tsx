import { setLocale } from "@/app/actions/locale";
import { LOCALE_NAMES, LOCALES } from "@/i18n/config";
import { getLocale, getT } from "@/i18n/server";
import { cx } from "./ui";

/** Sélecteur FR/DE. Fonctionne sans JavaScript (formulaire simple). */
export async function LanguageSwitcher({ className }: { className?: string }) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <form action={setLocale} className={cx("inline-flex rounded-lg border border-line p-0.5 text-sm", className)} aria-label={t.settings.language}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="submit"
          name="locale"
          value={l}
          lang={l}
          aria-pressed={l === locale}
          title={LOCALE_NAMES[l]}
          className={cx(
            "min-h-8 rounded-md px-2.5 font-semibold uppercase",
            l === locale ? "bg-ink text-bg" : "text-ink-2 hover:text-ink",
          )}
        >
          <span aria-hidden="true">{l}</span>
          <span className="sr-only">{LOCALE_NAMES[l]}</span>
        </button>
      ))}
    </form>
  );
}
