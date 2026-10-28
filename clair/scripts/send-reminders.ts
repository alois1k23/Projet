/**
 * Envoie les rappels d'échéances. À planifier une fois par jour (cron, tâche planifiée).
 * Usage : npm run reminders
 */
import { db } from "../src/lib/db";
import { logNotifier, sendDueReminders } from "../src/lib/reminders";

const appUrl = process.env.CLAIR_APP_URL ?? "http://localhost:3000";

sendDueReminders(logNotifier, appUrl)
  .then((count) => console.log(`${count} échéance(s) rappelée(s).`))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
