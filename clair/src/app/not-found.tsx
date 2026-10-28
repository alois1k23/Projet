import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { getT } from "@/i18n/server";

export default async function NotFound() {
  const t = (await getT()).errors;
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <Logo className="mb-8 justify-center" />
        <h1 className="text-3xl font-extrabold tracking-tight">{t.notFoundTitle}</h1>
        <p className="mt-2 text-ink-2">{t.notFoundText}</p>
        <ButtonLink href="/accueil" className="mt-6">{t.backHome}</ButtonLink>
      </div>
    </main>
  );
}
