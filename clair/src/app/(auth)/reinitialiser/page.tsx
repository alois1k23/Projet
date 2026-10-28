import type { Metadata } from "next";
import Link from "next/link";
import { peekAuthToken } from "@/lib/auth/tokens";
import { ButtonLink, Notice } from "@/components/ui";
import { ResetPasswordForm } from "../email-forms";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.resetTitle };
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton = "" } = await searchParams;
  const email = await peekAuthToken(jeton, "PASSWORD_RESET");
  const a = (await getT()).auth;
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{a.resetTitle}</h1>
      {email ? (
        <>
          <p className="mt-2 mb-8 text-ink-2">{a.forAccount(email)}</p>
          <ResetPasswordForm token={jeton} />
        </>
      ) : (
        <div className="mt-6 space-y-5">
          <Notice tone="warning">{a.resetExpired}</Notice>
          <ButtonLink href="/mot-de-passe-oublie">{a.getNewLink}</ButtonLink>
          <p className="text-sm">
            <Link href="/connexion" className="font-semibold text-primary hover:underline">{a.backToLogin}</Link>
          </p>
        </div>
      )}
    </>
  );
}
