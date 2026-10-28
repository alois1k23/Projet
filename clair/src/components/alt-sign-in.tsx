import { Mail } from "lucide-react";
import { buttonClass } from "./ui";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.7-4.9H1.3v3.1C3.2 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.3 6.6l4 3.1c1-2.8 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.7c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 5.1c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3-1.5z" />
    </svg>
  );
}

/** Autres façons de se connecter, affichées seulement si elles sont configurées sur le serveur. */
export function AltSignIn({ mail, google, apple }: { mail: boolean; google: boolean; apple: boolean }) {
  if (!mail && !google && !apple) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs font-semibold text-ink-3 uppercase" aria-hidden="true">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>
      {google ? (
        <a href="/api/auth/google" className={buttonClass("secondary", "lg", "w-full")}>
          <GoogleLogo /> Continuer avec Google
        </a>
      ) : null}
      {apple ? (
        <a href="/api/auth/apple" className={buttonClass("secondary", "lg", "w-full")}>
          <AppleLogo /> Continuer avec Apple
        </a>
      ) : null}
      {mail ? (
        <a href="/connexion/lien" className={buttonClass("secondary", "lg", "w-full")}>
          <Mail className="size-5" aria-hidden="true" /> Recevoir un lien par e-mail
        </a>
      ) : null}
    </div>
  );
}
