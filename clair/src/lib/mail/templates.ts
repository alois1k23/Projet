export interface Email {
  subject: string;
  text: string;
  html: string;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Mise en page sobre, lisible dans tous les clients de messagerie (tableaux et styles en ligne). */
export function layout({ title, intro, button, outro }: { title: string; intro: string[]; button?: { label: string; url: string }; outro?: string[] }): Email & { subject: string } {
  const p = (t: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#111827">${escapeHtml(t)}</p>`;
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
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
  const text = [title, "", ...intro, ...(button ? ["", `${button.label} : ${button.url}`] : []), "", ...(outro ?? [])].join("\n");
  return { subject: title, text, html };
}

export function passwordResetEmail(url: string): Email {
  return layout({
    title: "Choisissez un nouveau mot de passe",
    intro: ["Vous avez demandé à réinitialiser le mot de passe de votre compte Clair.", "Ce lien est valable une heure et ne fonctionne qu’une fois."],
    button: { label: "Choisir un nouveau mot de passe", url },
    outro: ["Vous n’êtes pas à l’origine de cette demande ? Ignorez cet e-mail : votre mot de passe actuel reste valable."],
  });
}

export function loginLinkEmail(url: string, newAccount: boolean): Email {
  return layout({
    title: newAccount ? "Bienvenue dans Clair" : "Votre lien de connexion",
    intro: [
      newAccount ? "Cliquez sur le bouton pour créer votre compte et commencer. Aucun mot de passe n’est nécessaire." : "Cliquez sur le bouton pour vous connecter à Clair.",
      "Ce lien est valable 15 minutes et ne fonctionne qu’une fois.",
    ],
    button: { label: newAccount ? "Créer mon compte" : "Me connecter", url },
    outro: ["Vous n’avez rien demandé ? Ignorez cet e-mail, personne ne pourra se connecter sans ce lien."],
  });
}

export function reminderEmail(firstName: string | null, lines: string[], url: string, count: number): Email {
  return layout({
    title: count === 1 ? "Une échéance approche" : `${count} échéances approchent`,
    intro: [`Bonjour${firstName ? ` ${firstName}` : ""},`, ...lines],
    button: { label: "Voir dans Clair", url },
    outro: ["Vous recevez ce rappel parce que ces échéances figurent dans votre compte Clair."],
  });
}
