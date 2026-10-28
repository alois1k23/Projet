import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, localeFromAcceptLanguage, type Locale } from "./config";
import { messages, type Messages } from "./messages";

/** Langue de la requête : profil de l'utilisateur, sinon choix enregistré, sinon langue du navigateur. */
export const getLocale = cache(async (): Promise<Locale> => {
  const user = await getCurrentUser();
  if (user && isLocale(user.locale)) return user.locale;
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  try {
    return localeFromAcceptLanguage((await headers()).get("accept-language"));
  } catch {
    return DEFAULT_LOCALE;
  }
});

export async function getT(): Promise<Messages> {
  return messages[await getLocale()];
}
