import { cx } from "./ui";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cx("shrink-0", className)}>
      <rect width="64" height="64" rx="15" fill="#1F4FD8" />
      <path d="M19 13h19l9 9v29a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2z" fill="#fff" />
      <path d="M38 13v7a2 2 0 0 0 2 2h7" fill="#C9D6F8" />
      <rect x="22" y="27" width="20" height="3" rx="1.5" fill="#C3CBDA" />
      <rect x="20.5" y="33.5" width="23" height="6" rx="2" fill="#FFD84D" />
      <rect x="22" y="35" width="16" height="3" rx="1.5" fill="#111827" />
      <rect x="22" y="43" width="14" height="3" rx="1.5" fill="#C3CBDA" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-8" />
      <span className="text-[21px] font-extrabold tracking-tight">clair</span>
    </span>
  );
}
