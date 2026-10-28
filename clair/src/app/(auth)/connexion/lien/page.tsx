import type { Metadata } from "next";
import Link from "next/link";
import { mailEnabled } from "@/lib/mail";
import { Notice } from "@/components/ui";
import { LoginLinkForm } from "../../email-forms";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.linkTitle };
}

export default async function LoginLinkPage() {
  const a = (await getT()).auth;
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{a.linkTitle}</h1>
      <p className="mt-2 mb-8 text-ink-2">{a.linkIntro}</p>
      {mailEnabled() ? <LoginLinkForm /> : <Notice tone="warning">{a.mailNotConfigured}</Notice>}
      <p className="mt-6 text-center text-sm text-ink-2">
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          {a.usePassword}
        </Link>
      </p>
    </>
  );
}
