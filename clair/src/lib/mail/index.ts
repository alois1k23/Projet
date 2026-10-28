import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface Mailer {
  readonly kind: "smtp" | "file";
  send(message: MailMessage): Promise<void>;
}

/** Envoi réel par SMTP (par exemple un fournisseur suisse). Configuré par CLAIR_SMTP_URL et CLAIR_MAIL_FROM. */
export class SmtpMailer implements Mailer {
  readonly kind = "smtp" as const;
  private transport;
  constructor(
    url: string,
    private readonly from: string,
  ) {
    this.transport = nodemailer.createTransport(url);
  }
  async send(message: MailMessage) {
    await this.transport.sendMail({ from: this.from, ...message });
  }
}

/**
 * Développement et tests : les e-mails sont écrits dans un fichier (une ligne JSON par e-mail)
 * au lieu d'être envoyés. Jamais utilisé en production sans activation explicite.
 */
export class FileMailer implements Mailer {
  readonly kind = "file" as const;
  constructor(private readonly file: string) {}
  async send(message: MailMessage) {
    await mkdir(path.dirname(this.file), { recursive: true });
    await appendFile(this.file, JSON.stringify({ ...message, sentAt: new Date().toISOString() }) + "\n", { mode: 0o600 });
    if (process.env.NODE_ENV !== "test") console.log(`[e-mail] à ${message.to} : ${message.subject}`);
  }
}

export function outboxPath(): string {
  return path.resolve(process.env.CLAIR_STORAGE_DIR ?? "./storage", "outbox.jsonl");
}

/** Retourne le service d'envoi configuré, ou null si l'envoi d'e-mails n'est pas disponible. */
export function getMailer(): Mailer | null {
  const smtp = process.env.CLAIR_SMTP_URL;
  if (smtp) return new SmtpMailer(smtp, process.env.CLAIR_MAIL_FROM ?? "Clair <bonjour@clair.example>");
  const transport = process.env.CLAIR_MAIL_TRANSPORT;
  if (transport === "file" || (!transport && process.env.NODE_ENV !== "production")) return new FileMailer(outboxPath());
  return null;
}

export function mailEnabled(): boolean {
  return getMailer() !== null;
}
