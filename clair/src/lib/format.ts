// Convention suisse pour les montants en francs, y compris en Romandie : 1’240.50.
const chf = new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const longDate = new Intl.DateTimeFormat("fr-CH", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("fr-CH", { day: "numeric", month: "short", timeZone: "UTC" });

export function formatMoney(amount: number | null | undefined, currency = "CHF"): string {
  if (amount === null || amount === undefined) return "—";
  return `${currency} ${chf.format(amount)}`;
}

export function formatDate(date: Date | null | undefined): string {
  return date ? longDate.format(date) : "—";
}

export function formatShortDate(date: Date | null | undefined): string {
  return date ? shortDate.format(date) : "—";
}

/** Convertit une valeur Decimal de Prisma (ou nombre) en nombre JavaScript. */
export function toNumber(value: { toNumber(): number } | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : value.toNumber();
}

/** Valide un IBAN (contrôle modulo 97, ISO 13616). */
export function isValidIban(raw: string): boolean {
  const iban = raw.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const value = /\d/.test(char) ? char : String(char.charCodeAt(0) - 55);
    for (const digit of value) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

export function formatIban(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim();
}
