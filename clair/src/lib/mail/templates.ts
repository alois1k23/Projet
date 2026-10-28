import type { Locale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

export interface Email {
  subject: string;
  text: string;
  html: string;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Mise en page sobre, lisible dans tous les clients de messagerie (tableaux et styles en ligne). */
export function layout({ title, intro, button, outro, locale = "fr" }: { title: string; intro: string[]; button?: { label: string; url: string }; outro?: string[]; locale?: Locale }): Email & { subject: string } {
  const p = (t: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#111827">${escapeHtml(t)}</p>`;
  const html = `<!doctype html><html lang="${locale}"><body style="margin:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;padding:32px">
<tr><td>
<p style="margin:0 0 24px;font-size:20px;font-weight:800;color:#1f4fd8">clair</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111827">${escapeHtml(title)}</h1>
${intro.map(p).join("")}
${button ? `<p style="margin:24px 0"><a href="${escapeHtml(button.url)}" style="display:inline-block;background:#1f4fd8;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px">${escapeHtml(button.label)}</a></p>
<p style="margin:0 0 16px;font-size:13px;color:#5f6877;word-break:break-all">${escapeHtml(button.url)}</p>` : ""}
${(outro ?? []).map((t) => `<p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#5f6877">${escapeHtml(t)}</p>`).join("")}
</td></tr></table></td></tr></table></body></html>`;
  const text = [title, "", ...intro, ...(button ? ["", `${button.label}${locale === "fr" ? " :" : ":"} ${button.url}`] : []), "", ...(outro ?? [])].join("\n");
  return { subject: title, text, html };
}

export function passwordResetEmail(url: string, locale: Locale = "fr"): Email {
  const m = messages[locale].email;
  return layout({ locale, title: m.resetTitle, intro: m.resetIntro, button: { label: m.resetButton, url }, outro: [m.resetOutro] });
}

export function loginLinkEmail(url: string, newAccount: boolean, locale: Locale = "fr"): Email {
  const m = messages[locale].email;
  return layout({
    locale,
    title: newAccount ? m.welcomeTitle : m.loginTitle,
    intro: [newAccount ? m.welcomeIntro : m.loginIntro, m.linkValidity],
    button: { label: newAccount ? m.welcomeButton : m.loginButton, url },
    outro: [m.linkOutro],
  });
}

export function reminderEmail(firstName: string | null, lines: string[], url: string, firstTitle: string, count: number, locale: Locale = "fr"): Email {
  const m = messages[locale].email;
  const email = layout({ locale, title: m.reminderTitle(count), intro: [m.hello(firstName), ...lines], button: { label: m.reminderButton, url }, outro: [m.reminderOutro] });
  return { ...email, subject: m.reminderSubject(count, firstTitle) };
}
