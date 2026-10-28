import type { Metadata } from "next";
import Link from "next/link";
import { Download, LogOut, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAnalyzer } from "@/lib/ai/analyzer";
import { analysesThisMonth, monthlyAllowance } from "@/lib/documents";
import { logout } from "@/app/actions/auth";
import { Badge, Card, Notice, PageHeader, buttonClass } from "@/components/ui";
import { ThemeToggle } from "@/components/client";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "./forms";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).settings.title };
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {description ? <p className="mt-1 mb-5 text-sm text-ink-2">{description}</p> : <div className="mb-5" />}
      {children}
    </Card>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const used = await analysesThisMonth(user.id);
  const allowance = monthlyAllowance(user.plan);
  const analyzer = getAnalyzer();
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const s = t.settings;

  return (
    <div className="grid animate-rise gap-6">
      <PageHeader title={s.title} />
      {user.demoExpiresAt ? <Notice tone="mark">{t.demo.expiresOn(formatDate(user.demoExpiresAt, locale))}</Notice> : null}

      <Section title={s.profile} description={s.profileDesc}>
        <ProfileForm defaults={{ name: user.name ?? "", addressLine: user.addressLine ?? "", postalCode: user.postalCode ?? "", city: user.city ?? "" }} />
      </Section>

      {user.demoExpiresAt ? null : (
        <Section
          title={s.connection}
          description={user.passwordHash ? s.connectionWithPassword : s.connectionWithoutPassword}
        >
          <PasswordForm hasPassword={Boolean(user.passwordHash)} />
        </Section>
      )}

      <Section title={s.plan}>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={user.plan === "PLUS" ? "primary" : "neutral"}>{user.plan === "PLUS" ? s.plus : s.free}</Badge>
          {Number.isFinite(allowance) ? (
            <p className="text-sm text-ink-2">
              <span className="tabular font-semibold text-ink">
                {s.usage(Math.min(used, allowance), allowance)}
              </span>{" "}
              {s.usageText}
            </p>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-ink-2">{s.plusSoon}</p>
      </Section>

      <Section title={s.language} description={s.languageDesc}>
        <LanguageSwitcher />
      </Section>

      <Section title={s.appearance}>
        <ThemeToggle />
      </Section>

      <Section title={s.data} description={s.dataDesc}>
        <ul className="mb-5 space-y-2 text-sm text-ink-2">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            {s.encrypted}
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            {analyzer?.name === "anthropic" ? s.aiAnthropic : s.aiNone}
          </li>
        </ul>
        <a href="/api/export" className={buttonClass("secondary")}>
          <Download className="size-4" aria-hidden="true" /> {s.export}
        </a>
        <p className="mt-2 text-xs text-ink-3">{s.exportHint}</p>
        <p className="mt-4 text-sm">
          <Link href="/confidentialite" className="font-semibold text-primary hover:underline">
            {s.privacyPolicy}
          </Link>
        </p>
      </Section>

      <Section title={s.session}>
        <form action={logout}>
          <button type="submit" className={buttonClass("secondary")}>
            <LogOut className="size-4" aria-hidden="true" /> {t.common.logout}
          </button>
        </form>
      </Section>

      <Card className="border-danger/30 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-danger">{s.dangerTitle}</h2>
        <p className="mt-1 mb-5 text-sm text-ink-2">{s.dangerText}</p>
        <DeleteAccountForm email={user.email} />
      </Card>
    </div>
  );
}
