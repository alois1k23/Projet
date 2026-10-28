/**
 * Envoie les rappels d’échéances et nettoie les jetons expirés. À planifier une fois par jour.
 * Usage : npm run reminders
 */
import { db } from "../src/lib/db";
import { getMailer } from "../src/lib/mail";
import { logNotifier, mailNotifier, sendDueReminders } from "../src/lib/reminders";
import { purgeExpiredTokens } from "../src/lib/auth/tokens";
import { purgeExpiredDemos } from "../src/lib/demo";

const appUrl = process.env.CLAIR_APP_URL ?? "http://localhost:3000";

async function main() {
  const mailer = getMailer();
  const count = await sendDueReminders(mailer ? mailNotifier(mailer) : logNotifier, appUrl);
  console.log(`${count} échéance(s) rappelée(s) via ${mailer ? mailer.kind : "le journal"}.`);
  console.log(`${await purgeExpiredTokens()} jeton(s) expiré(s) supprimé(s).`);
  console.log(`${await purgeExpiredDemos()} compte(s) de démonstration expiré(s) supprimé(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
