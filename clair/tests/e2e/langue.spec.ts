import { expect, test } from "@playwright/test";
import { expectAccessible, PASSWORD, uniqueEmail } from "./helpers";

test.describe("allemand", () => {
  test.use({ locale: "de-CH" });

  test("un visiteur germanophone voit le site en allemand et peut passer au français", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "de-CH");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ihre Behördenpost");
    await expectAccessible(page);

    await page.getByRole("banner").getByRole("button", { name: "Français" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Votre courrier administratif");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr-CH");
  });

  test("parcours complet en allemand : inscription, exemple, analyse et lettre", async ({ page }) => {
    const email = uniqueEmail("de");
    await page.goto("/inscription");
    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByLabel("Wählen Sie ein Passwort").fill(PASSWORD);
    await page.getByRole("button", { name: "Kostenloses Konto erstellen" }).click();
    await expect(page).toHaveURL(/\/accueil/);
    await expect(page.getByRole("navigation", { name: "Hauptnavigation" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Ein Zahlungsbefehl" }).click();
    await expect(page.getByRole("heading", { name: "Kurz gesagt" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Nächster Schritt" })).toBeVisible();
    await expectAccessible(page);

    // La lettre proposée est rédigée en allemand par défaut.
    await page.getByRole("region", { name: "Nächster Schritt" }).getByRole("link").filter({ hasText: /Schreiben|Brief/ }).first().click();
    await expect(page.getByLabel("Sprache des Briefs")).toHaveValue("de");
  });

  test("le choix de langue est enregistré dans le profil", async ({ page, browser }) => {
    const email = uniqueEmail("profil");
    await page.goto("/inscription");
    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByLabel("Wählen Sie ein Passwort").fill(PASSWORD);
    await page.getByRole("button", { name: "Kostenloses Konto erstellen" }).click();
    await expect(page).toHaveURL(/\/accueil/);
    // Inscrit en allemand (navigateur de-CH) : on repasse en français depuis les réglages.
    await page.goto("/reglages");
    await expect(page.getByRole("heading", { name: "Einstellungen" })).toBeVisible();
    await page.getByRole("main").getByRole("button", { name: "Français" }).click();
    await expect(page.getByRole("heading", { name: "Réglages" })).toBeVisible();

    // Une autre session, avec un navigateur germanophone, suit le profil et non le navigateur.
    const other = await browser.newContext({ locale: "de-CH" });
    const p2 = await other.newPage();
    await p2.goto("/connexion");
    await p2.getByLabel("E-Mail-Adresse").fill(email);
    await p2.getByLabel("Passwort", { exact: true }).fill(PASSWORD);
    await p2.getByRole("button", { name: "Anmelden" }).click();
    await expect(p2).toHaveURL(/\/accueil/);
    await expect(p2.locator("html")).toHaveAttribute("lang", "fr-CH");
    await other.close();
  });
});

test.describe("site public", () => {
  test("présentation : sections, tarifs, FAQ et liste d'attente", async ({ page }) => {
    await page.goto("/");
    for (const name of ["Comment ça marche", "Tarifs", "Questions fréquentes", "Vos documents restent les vôtres"]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
    await page.getByText("Combien coûtera Clair Plus ?").click();
    await expect(page.getByText(/Le prix n’est pas encore fixé/)).toBeVisible();

    const form = page.locator("#liste-attente");
    await form.getByLabel("Votre adresse e-mail").fill("pas-une-adresse");
    await form.getByRole("button", { name: "Me prévenir" }).click();
    await expect(form.getByText("Adresse e-mail invalide.")).toBeVisible();
    await form.getByLabel("Votre adresse e-mail").fill(uniqueEmail("attente"));
    await form.getByRole("button", { name: "Me prévenir" }).click();
    await expect(form.getByText(/C’est noté/)).toBeVisible();
    await expectAccessible(page);
  });

  test("guides : liste, article sourcé et version allemande", async ({ page }) => {
    await page.goto("/guides");
    await page.getByRole("link", { name: /Commandement de payer/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Commandement de payer");
    await expect(page.getByRole("link", { name: /RS 281\.1/ })).toHaveAttribute("href", /fedlex\.admin\.ch/);
    await expect(page).toHaveTitle(/Commandement de payer.* · Clair/);
    await expectAccessible(page);

    await page.getByRole("banner").getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Zahlungsbefehl");
  });

  test("fichiers de référencement", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    expect(xml).toContain("/guides/commandement-de-payer");
    expect(xml).not.toContain("/accueil");

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toContain("Sitemap:");

    const og = await request.get("/opengraph-image");
    expect(og.ok()).toBe(true);
    expect(og.headers()["content-type"]).toContain("image/png");
  });
});

test.describe("anglais", () => {
  test.use({ locale: "en-GB" });

  test("un visiteur anglophone voit le site en anglais et essaie la démo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-CH");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Your official mail");
    await expectAccessible(page);

    await page.getByRole("main").getByRole("button", { name: "Try the demo, no sign-up" }).first().click();
    await expect(page).toHaveURL(/\/accueil/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Emma");
    await page.goto("/courriers");
    await page.getByRole("link", { name: /Payment order/ }).first().click();
    await expect(page.getByRole("heading", { name: "In short" })).toBeVisible();
    await expect(page.getByText(/file an objection/).first()).toBeVisible();
    await expectAccessible(page);

    // Le numéro d'assuré est repris de l'analyse en anglais pour pré-remplir la résiliation.
    await page.goto("/courriers");
    await page.getByRole("link", { name: /health insurance premium/ }).first().click();
    await page.getByRole("link", { name: "Prepare the letter" }).first().click();
    await expect(page.getByLabel("Insured person or policy number")).toHaveValue("756.1234.5678.97");

    // Les lettres restent en français ou en allemand, les langues des administrations suisses.
    await page.goto("/lettres/nouvelle?modele=resiliation-contrat");
    await expect(page.getByLabel("Language of the letter")).toHaveValue("fr");
  });

  test("guide en anglais", async ({ page }) => {
    await page.goto("/guides/facture-qr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Paying a QR bill without mistakes");
  });
});
