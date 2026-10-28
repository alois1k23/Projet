import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ExampleLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-dvh">
      <SiteHeader signedIn={!!user} />
      <main id="contenu" className="mx-auto max-w-4xl px-4 pt-6 pb-16 sm:px-6 lg:pt-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
