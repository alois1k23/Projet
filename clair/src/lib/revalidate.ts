import { revalidatePath } from "next/cache";

/**
 * Invalide toutes les pages de l'application après une modification de données.
 * Attention : avec Next.js 15.5, un fichier loading.tsx dans (app) combiné à cette invalidation
 * bloquait les actions suivantes de la même page côté client. Voir TESTING.md avant d'en ajouter un.
 */
export function revalidateAppPages() {
  revalidatePath("/", "layout");
}
