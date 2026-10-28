import path from "node:path";
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { expectAccessible, PASSWORD, signup, uniqueEmail } from "./helpers";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);

test.describe("authentification", () => {
  test("redirige vers la connexion quand on n'est pas connecté", async ({ page }) => {
    await page.goto("/accueil");
    await expect(page).toHaveURL(/\/connexion/);
    const res = await page.request.get("/api/export");
    expect(res.status()).toBe(401);
  });

  test("valide le formulaire d'inscription", async ({ page }) => {
    await page.goto("/inscription");
    await page.getByLabel("Mot de passe").fill("court");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Indiquez votre prénom et nom.")).toBeVisible();
    await expect(page.getByText("Adresse e-mail invalide.")).toBeVisible();
    await expect(page.getByText(/au moins 10 caractères/).first()).toBeVisible();
    await expect(page.getByText(/Vous devez accepter/)).toBeVisible();
  });

  test("inscription, déconnexion, reconnexion et mauvais mot de passe", async ({ page }) => {
    const email = await signup(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sophie");
    await expect(page.getByText("Bienvenue dans Clair")).toBeVisible();

    await page.goto("/reglages");
    await page.getByRole("button", { name: "Se déconnecter" }).last().click();
    await expect(page).toHaveURL(/\/connexion/);

    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByLabel("Mot de passe").fill("mauvais mot de passe");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("E-mail ou mot de passe incorrect.")).toBeVisible();

    await page.getByLabel("Mot de passe").fill(PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/accueil/);
  });

  test("refuse un deuxième compte avec la même adresse", async ({ page, browser }) => {
    const email = await signup(page);
    const other = await browser.newPage();
    await other.goto("/inscription");
    await other.getByLabel("Prénom et nom").fill("Autre");
    await other.getByLabel("Adresse e-mail").fill(email.toUpperCase());
    await other.getByLabel("Mot de passe").fill(PASSWORD);
    await other.getByLabel(/J’accepte les/).check();
    await other.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(other.getByText(/Un compte existe déjà/)).toBeVisible();
    await other.close();
  });
});

test.describe("courriers", () => {
  test("parcours complet : courrier analysé, tâches, lettre et PDF", async ({ page }) => {
    await signup(page);
    await page.goto("/courriers/nouveau");
    await expect(page.getByText(/5 analyses automatiques restantes/)).toBeVisible();
    await page.locator("#file").setInputFiles(fixture("prime-2027.png"));
    await expect(page.getByText("prime-2027.png")).toBeVisible();
    await page.getByRole("button", { name: "Analyser ce courrier" }).click();

    await expect(page).toHaveURL(/\/courriers\/c[a-z0-9]{20,}$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nouvelle prime d’assurance-maladie 2027");
    await expect(page.getByText("Original en allemand")).toBeVisible();
    await expect(page.getByText("CHF 438.20", { exact: true })).toBeVisible();
    await expect(page.getByText(/Sans résiliation reçue à temps/)).toBeVisible();
    await expect(page.getByRole("img", { name: /Courrier original/ })).toBeVisible();

    // Le fichier original est servi déchiffré, uniquement à son propriétaire.
    const fileUrl = await page.getByRole("img", { name: /Courrier original/ }).getAttribute("src");
    const fileRes = await page.request.get(fileUrl!);
    expect(fileRes.headers()["content-type"]).toBe("image/png");
    expect(Buffer.from(await fileRes.body()).equals(await readFile(fixture("prime-2027.png")))).toBe(true);

    // Les actions sont devenues des échéances.
    const task = page.getByRole("checkbox", { name: /Comparer les primes 2027/ });
    await expect(task).not.toBeChecked();
    await task.check();
    await expect(page.getByRole("checkbox", { name: /Rouvrir : Comparer les primes 2027/ })).toBeChecked();

    // Lettre suggérée, pré-remplie à partir du courrier.
    await page.getByRole("link", { name: /Résilier une assurance/ }).click();
    await expect(page.getByLabel("Destinataire", { exact: true })).toHaveValue("Caisse-maladie Exemple SA");
    await expect(page.getByLabel("N° d’assuré ou de police")).toHaveValue("756.1234.5678.97");
    await expect(page.getByLabel("Type d’assurance")).toHaveValue("base");
    await page.getByLabel("Adresse du destinataire").fill("Case postale 42\n1000 Lausanne");
    await expect(page.getByText(/nouvel assureur vous aura confirmé/)).toBeVisible();
    await page.getByRole("button", { name: "Préparer la lettre" }).click();

    await expect(page.getByRole("heading", { name: "Votre lettre est prête" })).toBeVisible();
    const pdfRes = await page.request.get(await page.getByRole("link", { name: "Télécharger le PDF" }).getAttribute("href") as string);
    expect(pdfRes.status()).toBe(200);
    expect(pdfRes.headers()["content-type"]).toBe("application/pdf");
    expect(Buffer.from(await pdfRes.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("signale un courrier difficile à lire et permet de le corriger", async ({ page }) => {
    await signup(page);
    await page.goto("/courriers/nouveau");
    await page.locator("#file").setInputFiles(fixture("facture-flou.png"));
    await page.getByRole("button", { name: "Analyser ce courrier" }).click();
    await expect(page.getByText("Vérifiez les informations signalées")).toBeVisible();
    await expect(page.getByText("À vérifier").first()).toBeVisible();

    await page.getByText("Corriger les informations").click();
    await page.getByLabel("Montant").fill("1'284.30");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("CHF 1’284.30", { exact: true })).toBeVisible();
    await expect(page.getByText("À vérifier")).toHaveCount(0);
    await expect(page.getByText("Vérifiez les informations signalées")).toHaveCount(0);
  });

  test("refuse un fichier qui n'est pas une image ni un PDF", async ({ page }) => {
    await signup(page);
    await page.goto("/courriers/nouveau");
    await page.locator("#file").setInputFiles(fixture("note.txt"));
    await page.getByRole("button", { name: "Analyser ce courrier" }).click();
    await expect(page.getByText(/Format non pris en charge/)).toBeVisible();
  });

  test("courrier d'exemple, recherche et suppression", async ({ page }) => {
    await signup(page);
    await page.getByRole("button", { name: /Une facture avec QR-code/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Facture d’électricité juillet–septembre");
    await expect(page.getByText("CH44 3199 9123 0008 8901 2", { exact: true })).toBeVisible();
    await expect(page.getByText("Exemple", { exact: true })).toBeVisible();

    await page.goto("/accueil");
    await expect(page.getByText(/1 chose à faire cette semaine|1 chose à faire/)).toBeVisible();

    await page.goto("/courriers?q=électricité");
    await expect(page.getByRole("link", { name: /Facture d’électricité/ })).toBeVisible();
    await page.goto("/courriers?q=introuvable");
    await expect(page.getByText(/Aucun courrier ne correspond/)).toBeVisible();

    await page.goto("/courriers");
    await page.getByRole("link", { name: /Facture d’électricité/ }).click();
    await page.getByRole("button", { name: "Supprimer ce courrier" }).click();
    await page.getByRole("button", { name: "Supprimer définitivement" }).click();
    await expect(page.getByText("Le courrier et son fichier ont été supprimés.")).toBeVisible();
  });

  test("un utilisateur ne peut pas voir le courrier d'un autre", async ({ page, browser }) => {
    await signup(page);
    await page.getByRole("button", { name: /Un commandement de payer/ }).click();
    await expect(page).toHaveURL(/\/courriers\/c[a-z0-9]{20,}$/);
    const url = page.url();

    const intruderContext = await browser.newContext();
    const intruder = await intruderContext.newPage();
    await signup(intruder, uniqueEmail("intrus"), "Intrus");
    await intruder.goto(url);
    await expect(intruder.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
    await intruderContext.close();
  });
});

test.describe("échéances, réglages et données", () => {
  test("ajouter une échéance et l'exporter vers l'agenda", async ({ page }) => {
    await signup(page);
    await page.goto("/echeances");
    await page.getByLabel("Nouvelle échéance").fill("Renvoyer le formulaire de la commune");
    await page.getByLabel("Date").fill("2026-11-20");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("Échéance ajoutée.")).toBeVisible();
    await expect(page.getByText("Renvoyer le formulaire de la commune")).toBeVisible();

    const ics = await page.request.get("/api/agenda");
    expect(ics.headers()["content-type"]).toContain("text/calendar");
    const body = await ics.text();
    expect(body).toContain("SUMMARY:Renvoyer le formulaire de la commune");
    expect(body).toContain("DTSTART;VALUE=DATE:20261120");
  });

  test("profil, export des données et suppression du compte", async ({ page }) => {
    const email = await signup(page);
    await page.getByRole("button", { name: /Un commandement de payer/ }).click();

    await page.goto("/reglages");
    await page.getByLabel("Rue et numéro").fill("Rue du Lac 12");
    await page.getByLabel("NPA").fill("10");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText(/NPA invalide/)).toBeVisible();
    await page.getByLabel("NPA").fill("1003");
    await page.getByLabel("Localité").fill("Lausanne");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Profil enregistré.")).toBeVisible();

    const exported = await (await page.request.get("/api/export")).json();
    expect(exported.profile).toMatchObject({ email, city: "Lausanne", postalCode: "1003" });
    expect(exported.documents).toHaveLength(1);
    expect(exported.tasks).toHaveLength(2);
    expect(JSON.stringify(exported)).not.toContain("passwordHash");

    await page.getByLabel("Adresse e-mail du compte").fill("autre@example.ch");
    await page.getByRole("button", { name: "Supprimer définitivement mon compte" }).click();
    await expect(page.getByText(/Saisissez exactement/)).toBeVisible();
    await page.getByLabel("Adresse e-mail du compte").fill(email);
    await page.getByRole("button", { name: "Supprimer définitivement mon compte" }).click();
    await expect(page.getByText("Votre compte et toutes vos données ont été supprimés.")).toBeVisible();

    await page.goto("/connexion");
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByLabel("Mot de passe").fill(PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("E-mail ou mot de passe incorrect.")).toBeVisible();
  });
});

test.describe("accessibilité", () => {
  test("pages publiques sans violation grave", async ({ page }) => {
    for (const url of ["/", "/connexion", "/inscription", "/confidentialite"]) {
      await page.goto(url);
      await expectAccessible(page);
    }
  });

  test("écrans de l'application sans violation grave, en clair et en sombre", async ({ page }) => {
    await signup(page);
    await page.getByRole("button", { name: /Un commandement de payer/ }).click();
    await expect(page).toHaveURL(/\/courriers\/c[a-z0-9]{20,}$/);
    const docUrl = page.url();
    for (const theme of ["light", "dark"]) {
      await page.evaluate((t) => localStorage.setItem("clair-theme", t), theme);
      for (const url of ["/accueil", "/courriers", docUrl, "/echeances", "/lettres/nouvelle?modele=delai-paiement", "/reglages", "/courriers/nouveau"]) {
        await page.goto(url);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expectAccessible(page);
      }
    }
  });
});
