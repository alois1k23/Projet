import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

let counter = 0;

export function uniqueEmail(prefix = "test") {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}@example.ch`;
}

export const PASSWORD = "une phrase secrète solide";

export async function signup(page: Page, email = uniqueEmail(), name = "Sophie Martin") {
  await page.goto("/inscription");
  await page.getByLabel("Prénom et nom").fill(name);
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByLabel(/J’accepte les/).check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/accueil/);
  return email;
}

/** Échoue en cas de violation d'accessibilité grave ou critique (WCAG 2.1 A/AA). */
export async function expectAccessible(page: Page) {
  // Mesure l'état final, sans l'animation d'apparition qui réduit temporairement l'opacité.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
  const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} élément(s)) ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
