import type { Metadata } from "next";
import { LoginForm } from "../forms";
import { Notice } from "@/components/ui";
import { AltSignIn } from "@/components/alt-sign-in";
import { mailEnabled } from "@/lib/mail";
import { signInOptions } from "@/lib/auth/providers";
import { getT } from "@/i18n/server";
import { DemoButton } from "@/components/demo-button";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.login };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  const a = (await getT()).auth;
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{a.loginTitle}</h1>
      <p className="mt-2 mb-8 text-ink-2">{a.loginIntro}</p>
      <div className="space-y-6">
        {erreur === "google" || erreur === "apple" ? (
          <Notice tone="danger">{a.oauthError(erreur === "google" ? "Google" : "Apple")}</Notice>
        ) : null}
        <LoginForm mail={mailEnabled()} />
        <AltSignIn mail={mailEnabled()} {...signInOptions()} />
        <DemoButton variant="secondary" size="md" className="border-t border-line pt-6" />
      </div>
    </>
  );
}
