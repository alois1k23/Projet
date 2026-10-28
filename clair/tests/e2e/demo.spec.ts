import path from "node:path";
import { expect, test } from "@playwright/test";
import { expectAccessible } from "./helpers";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);

test.describe("mode démo", () => {
  test("un clic ouvre une démo complète, puis on la quitte pour créer un vrai compte", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("button", { name: "Essayer la démo, sans inscription" }).first().click();
    await expect(page).toHaveURL(/\/accueil/);
    await expect(page.getByRole("status").filter({ hasText: "Démo : compte temporaire" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sophie");
    await expectAccessible(page);

    // Les trois courriers d'exemple sont déjà expliqués.
    await page.goto("/courriers");
    await expect(page.getByText("3 courriers dans votre dossier")).toBeVisible();
    await page.getByRole("link", { name: /Commandement de payer/ }).first().click();
    await expect(page.getByRole("region", { name: "Prochaine étape" })).toBeVisible();

    // Une lettre se prépare sans rien saisir sur soi : le profil de démo est rempli.
    await page.goto("/lettres/nouvelle?modele=delai-paiement");
    await expect(page.getByText("Vos coordonnées")).toHaveCount(0);
    await page.getByLabel("Destinataire", { exact: true }).fill("Office des poursuites");
    await page.getByLabel("Adresse du destinataire").fill("Rue de l’Exemple 1\n1000 Lausanne");
    for (const field of await page.locator("form input:not([type=hidden]), form textarea").all()) {
      if ((await field.inputValue()) === "" && (await field.getAttribute("aria-invalid")) !== null) {
        const type = await field.getAttribute("type");
        await field.fill(type === "date" ? "2026-12-15" : "123");
      }
    }
    await page.getByRole("button", { name: "Préparer la lettre" }).click();
    await expect(page.getByRole("heading", { name: "Votre lettre est prête" })).toBeVisible();
    await expect(page.getByText("Rue du Lac 12")).toBeVisible();

    // Ajouter une photo fonctionne, avec une analyse simulée annoncée comme telle.
    await page.goto("/courriers/nouveau");
    await expect(page.getByText(/n’est transmis à aucun service d’analyse/)).toBeVisible();
    await page.getByTestId("desktop-file").setInputFiles(fixture("prime-2027.png"));
    await expect(page).toHaveURL(/\/courriers\/c[a-z0-9]{20,}$/);
    await expect(page.getByText(/Les analyses sont simulées/)).toBeVisible();

    // Les réglages annoncent l'effacement ; pas de mot de passe à gérer.
    await page.goto("/reglages");
    await expect(page.getByText(/Ce compte de démonstration sera effacé le/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connexion" })).toHaveCount(0);

    await page.getByRole("button", { name: "Créer mon vrai compte" }).click();
    await expect(page).toHaveURL(/\/inscription/);
    await page.goto("/accueil");
    await expect(page).toHaveURL(/\/connexion/);
  });

  test.describe("en allemand", () => {
    test.use({ locale: "de-CH" });
    test("la démo est remplie en allemand", async ({ page }) => {
      await page.goto("/inscription");
      await page.getByRole("button", { name: "Demo ausprobieren, ohne Anmeldung" }).click();
      await expect(page).toHaveURL(/\/accueil/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Lukas");
      await page.goto("/courriers");
      await expect(page.getByRole("link", { name: /Zahlungsbefehl/ }).first()).toBeVisible();
    });
  });
});
