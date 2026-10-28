import type { Metadata } from "next";
import { peekAuthToken } from "@/lib/auth/tokens";
import { ButtonLink, Notice } from "@/components/ui";
import { ConfirmLoginForm } from "../../email-forms";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.verifyTitle };
}

export default async function VerifyLoginPage({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton = "" } = await searchParams;
  const email = await peekAuthToken(jeton, "LOGIN");
  const a = (await getT()).auth;
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{a.verifyTitle}</h1>
      {email ? (
        <>
          <p className="mt-2 mb-8 text-ink-2">{a.verifyIntro(email)}</p>
          <ConfirmLoginForm token={jeton} />
        </>
      ) : (
        <div className="mt-6 space-y-5">
          <Notice tone="warning">{a.verifyExpired}</Notice>
          <ButtonLink href="/connexion/lien">{a.getNewLink}</ButtonLink>
        </div>
      )}
    </>
  );
}
