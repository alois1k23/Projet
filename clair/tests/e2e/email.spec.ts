import { expect, test } from "@playwright/test";
import { emailsTo, linkIn, PASSWORD, signup, uniqueEmail } from "./helpers";

test.describe("e-mails d’authentification", () => {
  test("mot de passe oublié : lien unique, nouveau mot de passe, connexion", async ({ page, browser }) => {
    const email = await signup(page);
    await page.context().clearCookies();

    await page.goto("/connexion");
    await page.getByRole("link", { name: "Mot de passe oublié ?" }).click();
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByRole("button", { name: "Recevoir un lien" }).click();
    await expect(page.getByText(/C’est envoyé/)).toBeVisible();

    const [mail] = emailsTo(email);
    expect(mail!.subject).toBe("Choisissez un nouveau mot de passe");
    const link = linkIn(mail!.text);
    await page.goto(link);
    await expect(page.getByText(`Pour le compte ${email}.`)).toBeVisible();
    await page.getByLabel("Nouveau mot de passe").fill("un tout nouveau secret");
    await page.getByRole("button", { name: "Enregistrer et me connecter" }).click();
    await expect(page).toHaveURL(/\/accueil/);

    // Le lien ne sert qu’une fois.
    const other = await browser.newPage();
    await other.goto(link);
    await expect(other.getByText(/Ce lien n’est plus valable/)).toBeVisible();

    // L’ancien mot de passe ne fonctionne plus, le nouveau oui.
    await other.goto("/connexion");
    await other.getByLabel("Adresse e-mail").fill(email);
    await other.getByLabel("Mot de passe", { exact: true }).fill(PASSWORD);
    await other.getByRole("button", { name: "Se connecter" }).click();
    await expect(other.getByText("E-mail ou mot de passe incorrect.")).toBeVisible();
    await other.getByLabel("Mot de passe", { exact: true }).fill("un tout nouveau secret");
    await other.getByRole("button", { name: "Se connecter" }).click();
    await expect(other).toHaveURL(/\/accueil/);
    await other.close();
  });

  test("ne révèle pas si une adresse a un compte", async ({ page }) => {
    const unknown = uniqueEmail("inconnu");
    await page.goto("/mot-de-passe-oublie");
    await page.getByLabel("Adresse e-mail").fill(unknown);
    await page.getByRole("button", { name: "Recevoir un lien" }).click();
    await expect(page.getByText(/C’est envoyé/)).toBeVisible();
    expect(emailsTo(unknown)).toHaveLength(0);
  });

  test("lien de connexion : crée le compte sans mot de passe, résiste à l’ouverture automatique", async ({ page }) => {
    const email = uniqueEmail("lien");
    await page.goto("/inscription");
    await page.getByRole("link", { name: "Recevoir un lien par e-mail" }).click();
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByRole("button", { name: "Recevoir mon lien de connexion" }).click();
    await expect(page.getByText(/C’est envoyé/)).toBeVisible();

    const [mail] = emailsTo(email);
    expect(mail!.subject).toBe("Bienvenue dans Clair");
    const link = linkIn(mail!.text);

    // Un antivirus qui « ouvre » le lien (simple GET) ne le consomme pas.
    expect((await page.request.get(link)).status()).toBe(200);
    await page.goto(link);
    await expect(page.getByText(`Vous allez vous connecter avec ${email}.`)).toBeVisible();
    await page.getByRole("button", { name: "Me connecter" }).click();
    await expect(page).toHaveURL(/\/accueil\?bienvenue=1/);

    // Ce compte peut ensuite définir un mot de passe.
    await page.goto("/reglages");
    await expect(page.getByText(/Vous vous connectez par lien e-mail/)).toBeVisible();
    await page.getByLabel("Mot de passe", { exact: true }).fill("mon mot de passe neuf");
    await page.getByRole("button", { name: "Définir un mot de passe" }).click();
    await expect(page.getByText(/Mot de passe enregistré/)).toBeVisible();
  });
});
