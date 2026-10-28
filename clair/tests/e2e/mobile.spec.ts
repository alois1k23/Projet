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
  await page.getByLabel("Choisir une photo ou un PDF").setInputFiles(path.join(__dirname, "fixtures", "prime-2027.png"));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("assurance-maladie");
  await expectNoHorizontalScroll(page);

  for (const label of ["À faire", "Courriers", "Réglages", "Accueil"]) {
    await nav.getByRole("link", { name: label }).click();
    await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    await expectNoHorizontalScroll(page);
  }

  await page.goto("/lettres/nouvelle?modele=contestation-facture");
  await expectNoHorizontalScroll(page);
});
