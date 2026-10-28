import { PASSWORD_MIN_LENGTH } from "@/lib/auth/constants";
import type { Messages } from "./messages";

/**
 * Les schémas Zod des actions utilisent des codes comme messages (« invalidEmail », « passwordMin »…),
 * traduits ici au moment de répondre.
 */
export function issueText(code: string, t: Messages): string {
  const v = t.validation;
  switch (code) {
    case "passwordMin":
      return v.passwordMin(PASSWORD_MIN_LENGTH);
    case "enterPassword":
      return t.auth.enterPassword;
    default: {
      const value = (v as Record<string, unknown>)[code];
      return typeof value === "string" ? value : v.invalidChoice;
    }
  }
}

export function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[], t: Messages, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    out[prefix ? `${prefix}${key.replace(/^./, (c) => c.toUpperCase())}` : key] ??= issueText(issue.message, t);
  }
  return out;
}
