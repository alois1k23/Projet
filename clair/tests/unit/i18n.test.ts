import { describe, expect, it } from "vitest";
import { fr } from "@/i18n/fr";
import { de } from "@/i18n/de";
import { siteMessages } from "@/i18n/site";
import { isLocale, localeFromAcceptLanguage } from "@/i18n/config";
import { issueText } from "@/i18n/issues";
import { getGuide, GUIDE_SLUGS, listGuides } from "@/content/guides";
import { loginLinkEmail, passwordResetEmail } from "@/lib/mail/templates";
import { SAMPLES } from "@/lib/samples";
import { normalizeAnalysis } from "@/lib/ai/schema";

/** Liste les chemins de toutes les feuilles d'un dictionnaire (chaînes, fonctions, tableaux). */
function leaves(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("dictionnaires", () => {
  it("l'allemand a exactement les mêmes clés que le français", () => {
    expect(leaves(de).sort()).toEqual(leaves(fr).sort());
    expect(leaves(siteMessages.de).sort()).toEqual(leaves(siteMessages.fr).sort());
  });

  it("aucun texte n'est vide et l'allemand suisse n'utilise pas « ß »", () => {
    for (const dict of [fr, de, siteMessages.fr, siteMessages.de]) {
      for (const s of strings(dict)) expect(s.trim().length).toBeGreaterThan(0);
    }
    for (const s of [...strings(de), ...strings(siteMessages.de)]) expect(s).not.toContain("ß");
  });

  it("les fonctions produisent des phrases dans les deux langues", () => {
    expect(fr.home.urgent(1)).toBe("1 chose à faire cette semaine");
    expect(fr.home.urgent(3)).toBe("3 choses à faire cette semaine");
    expect(de.upload.pagesReady(2)).toMatch(/2/);
    expect(de.auth.tooManyAttempts(1)).not.toEqual(fr.auth.tooManyAttempts(1));
  });
});

describe("choix de la langue", () => {
  it("reconnaît les langues prises en charge", () => {
    expect(isLocale("de")).toBe(true);
    expect(isLocale("it")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("suit les préférences du navigateur", () => {
    expect(localeFromAcceptLanguage("de-CH,de;q=0.9,fr;q=0.8")).toBe("de");
    expect(localeFromAcceptLanguage("en-US,en;q=0.9,de;q=0.5,fr;q=0.7")).toBe("fr");
    expect(localeFromAcceptLanguage("it-CH")).toBe("fr");
    expect(localeFromAcceptLanguage(null)).toBe("fr");
    expect(localeFromAcceptLanguage("garbage;q=x")).toBe("fr");
  });

  it("traduit les codes d'erreur de validation", () => {
    expect(issueText("invalidEmail", de)).toBe(de.validation.invalidEmail);
    expect(issueText("passwordMin", fr)).toContain("10");
    expect(issueText("npa", de)).toBe(de.validation.npa);
    expect(issueText("inconnu", fr)).toBe(fr.validation.invalidChoice);
  });
});

describe("e-mails", () => {
  it("sont rédigés dans la langue demandée", () => {
    const deMail = passwordResetEmail("https://app.example/reinitialiser?jeton=x", "de");
    expect(deMail.html).toContain('lang="de"');
    expect(deMail.subject).toBe(de.email.resetTitle);
    expect(deMail.text).toContain("https://app.example/reinitialiser?jeton=x");
    expect(loginLinkEmail("https://x", true, "fr").subject).toBe(fr.email.welcomeTitle);
    expect(loginLinkEmail("https://x", false, "de").subject).toBe(de.email.loginTitle);
  });

  it("échappent le HTML", () => {
    expect(passwordResetEmail('https://x/"><script>', "fr").html).not.toContain("<script>");
  });
});

describe("contenus", () => {
  it("chaque guide existe dans les deux langues, avec des sources officielles en https", () => {
    for (const slug of GUIDE_SLUGS) {
      for (const locale of ["fr", "de"] as const) {
        const g = getGuide(slug, locale);
        expect(g, `${slug}/${locale}`).not.toBeNull();
        expect(g!.sections.length).toBeGreaterThan(1);
        expect(g!.sources.length).toBeGreaterThan(0);
        for (const s of g!.sources) expect(s.url).toMatch(/^https:\/\//);
      }
    }
    expect(listGuides("de").map((g) => g.slug)).toEqual(listGuides("fr").map((g) => g.slug));
    expect(getGuide("inconnu", "fr")).toBeNull();
  });

  it("les exemples existent en allemand", () => {
    const today = new Date("2026-10-28T00:00:00Z");
    for (const sample of SAMPLES) {
      expect(sample.label.de.length).toBeGreaterThan(3);
      const a = normalizeAnalysis(sample.analysis(today, "de"));
      expect(a.summary).not.toEqual(normalizeAnalysis(sample.analysis(today, "fr")).summary);
    }
  });
});
