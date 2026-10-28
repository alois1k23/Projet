import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/accueil");
  return (
    <div className="flex min-h-dvh flex-col px-4 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-10 inline-flex rounded-lg" aria-label="Clair, retour à l’accueil">
          <Logo />
        </Link>
        {children}
      </div>
      <footer className="mx-auto mt-auto flex w-full max-w-md gap-4 pt-10 text-sm text-ink-3">
        <Link href="/confidentialite" className="hover:text-ink">Confidentialité</Link>
        <Link href="/conditions" className="hover:text-ink">Conditions</Link>
      </footer>
    </div>
  );
}
