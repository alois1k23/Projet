import type { Metadata } from "next";
import Link from "next/link";
import { mailEnabled } from "@/lib/mail";
import { Notice } from "@/components/ui";
import { ForgotPasswordForm } from "../email-forms";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.forgotTitle };
}

export default async function ForgotPasswordPage() {
  const a = (await getT()).auth;
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{a.forgotTitle}</h1>
      <p className="mt-2 mb-8 text-ink-2">{a.forgotIntro}</p>
      {mailEnabled() ? <ForgotPasswordForm /> : <Notice tone="warning">{a.mailNotConfigured}</Notice>}
      <p className="mt-6 text-center text-sm text-ink-2">
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          {a.backToLogin}
        </Link>
      </p>
    </>
  );
}
