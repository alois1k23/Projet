import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { getCurrentUser } from "@/lib/auth/session";

export default async function GuidesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-dvh">
      <SiteHeader signedIn={!!user} />
      <main id="contenu" className="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-6 lg:pt-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
