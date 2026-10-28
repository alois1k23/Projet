import type { Locale } from "./config";
import { fr } from "./fr";
import { de } from "./de";
import { en } from "./en";

export type Messages = typeof fr;

export const messages: Record<Locale, Messages> = { fr, de, en };
