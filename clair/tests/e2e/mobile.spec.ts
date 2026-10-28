import path from "node:path";
import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, signup } from "./helpers";

test("parcours mobile : navigation du bas, ajout et lecture d'un courrier sans défilement horizontal", async ({ page }) => {
  await page.goto("/");
  await expectNoHorizontalScroll(page);
  await signup(page);

  const nav = page.getByRole("navigation", { name: "Navigation principale" }).last();
  await expect(nav).toBeVisible();
  await expectNoHorizontalScroll(page);

  await nav.getByRole("link", { name: "Ajouter un courrier" }).click();
  await expect(page.getByText("Prendre une photo")).toBeVisible();
  // Le bouton « Choisir des fichiers » est réservé aux ordinateurs.
  await expect(page.getByText("Choisir des fichiers", { exact: true })).toBeHidden();
  // Appareil photo : on prend deux pages, puis on lance l'analyse.
  const fixture = path.join(__dirname, "fixtures", "prime-2027.png");
  await page.getByLabel("Prendre une photo").setInputFiles(fixture);
  await expect(page.getByText("1 page prête")).toBeVisible();
  await page.getByLabel("Ajouter une page").setInputFiles(fixture);
  await expect(page.getByText("2 pages prêtes")).toBeVisible();
  await page.getByRole("button", { name: "Analyser les 2 pages" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("assurance-maladie");
  await expect(page.getByRole("img", { name: /^Page 1 :/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /^Page 2 :/ })).toBeVisible();
  await expectNoHorizontalScroll(page);

  for (const label of ["À faire", "Courriers", "Réglages", "Accueil"]) {
    await nav.getByRole("link", { name: label }).click();
    await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    await expectNoHorizontalScroll(page);
  }

  await page.goto("/lettres/nouvelle?modele=contestation-facture");
  await expectNoHorizontalScroll(page);
});
