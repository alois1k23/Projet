"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CalendarClock, Check, Copy, FileText, Home, Inbox, Moon, Plus, Settings, Sun } from "lucide-react";
import { buttonClass, cx } from "./ui";
import { useT } from "@/i18n/client";

export function SubmitButton({
  children,
  pendingLabel,
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { pendingLabel?: string; variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || props.disabled} aria-busy={pending} className={buttonClass(variant, size, className)} {...props}>
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function CopyButton({ value, label, variant = "ghost" }: { value: string; label?: string; variant?: "ghost" | "secondary" }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const text = label ?? t.common.copy;
  return (
    <button
      type="button"
      className={variant === "ghost" ? buttonClass("ghost", "sm", "h-8 px-2") : buttonClass("secondary", "md")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
      aria-label={copied ? t.common.copied : label ? undefined : t.common.copyValue(text, value)}
    >
      {copied ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span className={variant === "ghost" ? "text-xs" : undefined}>{copied ? t.common.copied : text}</span>
    </button>
  );
}

export function ThemeToggle() {
  const t = useT();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className={buttonClass("secondary", "md")}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("clair-theme", next);
        } catch {}
        setTheme(next);
      }}
    >
      {theme === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      {theme === "dark" ? t.common.toLight : t.common.toDark}
    </button>
  );
}

const NAV = [
  { href: "/accueil", key: "home", icon: Home },
  { href: "/courriers", key: "documents", icon: Inbox },
  { href: "/echeances", key: "todo", icon: CalendarClock },
  { href: "/lettres", key: "letters", icon: FileText },
  { href: "/reglages", key: "settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navigation latérale (ordinateur). */
export function SideNav() {
  const t = useT();
  const pathname = usePathname();
  return (
    <nav aria-label={t.nav.main} className="flex flex-col gap-1">
      <Link href="/courriers/nouveau" className={buttonClass("primary", "md", "mb-4 w-full")}>
        <Plus className="size-4" aria-hidden="true" /> {t.nav.add}
      </Link>
      {NAV.map(({ href, key, icon: Icon }) => {
        const label = t.nav[key];
        const active = isActive(pathname, href) && !(href === "/courriers" && pathname === "/courriers/nouveau");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors",
              active ? "bg-primary-soft text-primary" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barre d’onglets en bas d’écran (mobile), avec le bouton d’ajout au centre. */
export function BottomNav() {
  const t = useT();
  const pathname = usePathname();
  const items = [NAV[0], NAV[1], null, NAV[2], NAV[4]];
  return (
    <nav
      aria-label={t.nav.main}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-2">
        {items.map((item) => {
          if (!item) {
            return (
              <li key="add" className="flex justify-center">
                <Link
                  href="/courriers/nouveau"
                  aria-label={t.nav.add}
                  className="grid size-12 -translate-y-3 place-items-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/30 transition-transform active:scale-95"
                >
                  <Plus className="size-6" aria-hidden="true" />
                </Link>
              </li>
            );
          }
          const { href, key, icon: Icon } = item;
          const label = t.nav[key];
          const active = isActive(pathname, href) && !(href === "/courriers" && pathname === "/courriers/nouveau");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx("flex flex-col items-center gap-0.5 py-1 text-[11px] font-semibold", active ? "text-primary" : "text-ink-3")}
              >
                <Icon className="size-[22px]" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AutoSubmitCheckbox({ name, defaultChecked, label, children }: { name: string; defaultChecked: boolean; label: string; children?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <label className="relative grid size-6 shrink-0 cursor-pointer place-items-center">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={pending}
        aria-label={label}
        className="peer size-6 cursor-pointer appearance-none rounded-lg border-2 border-line-strong transition-colors checked:border-success checked:bg-success"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      />
      <Check className="pointer-events-none absolute size-4 text-white opacity-0 peer-checked:opacity-100" aria-hidden="true" />
      {children}
    </label>
  );
}

/** Bouton de suppression en deux temps : un premier clic demande confirmation. */
export function ConfirmSubmit({ children, confirmLabel, className }: { children: ReactNode; confirmLabel: string; className?: string }) {
  const t = useT();
  const [confirming, setConfirming] = useState(false);
  const { pending } = useFormStatus();
  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={buttonClass("ghost", "sm", cx("text-danger hover:text-danger", className))}>
        {children}
      </button>
    );
  }
  return (
    <span className={cx("flex flex-wrap items-center gap-2", className)}>
      <button type="submit" disabled={pending} className={buttonClass("danger", "sm")} autoFocus>
        {pending ? t.common.deleting : confirmLabel}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className={buttonClass("ghost", "sm")}>
        {t.common.cancel}
      </button>
    </span>
  );
}
