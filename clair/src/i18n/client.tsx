"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import { messages, type Messages } from "./messages";

const LocaleContext = createContext<Locale>("fr");

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Textes de l'interface dans la langue courante (composants client). */
export function useT(): Messages {
  return messages[useContext(LocaleContext)];
}
