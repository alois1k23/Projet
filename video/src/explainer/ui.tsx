import type { CSSProperties, ReactNode } from "react";
import { interpolate } from "remotion";
import { C, FONT, clamp } from "./theme";

/** Taille logique de l'écran du téléphone (comme un iPhone), agrandie à l'affichage. */
export const SCREEN_W = 390;
export const SCREEN_H = 820;
export const SCREEN_SCALE = 1.36;

export function LogoMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={{ display: "block" }}>
      <rect width="64" height="64" rx="15" fill={C.primary} />
      <path d="M19 13h19l9 9v29a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2z" fill="#fff" />
      <path d="M38 13v7a2 2 0 0 0 2 2h7" fill="#C9D6F8" />
      <rect x="22" y="27" width="20" height="3" rx="1.5" fill="#C3CBDA" />
      <rect x="20.5" y="33.5" width="23" height="6" rx="2" fill={C.mark} />
      <rect x="22" y="35" width="16" height="3" rx="1.5" fill={C.ink} />
      <rect x="22" y="43" width="14" height="3" rx="1.5" fill="#C3CBDA" />
    </svg>
  );
}

type IconName = "home" | "inbox" | "plus" | "todo" | "settings" | "copy" | "check" | "back" | "search" | "doc" | "pen" | "bell" | "calendar" | "lock" | "shield" | "trash" | "camera" | "alert" | "download" | "globe";

/** Icônes au trait (style Lucide), dessinées ici pour rester nettes à toutes les tailles. */
export function Icon({ name, size = 20, color = "currentColor", stroke = 2 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  const p = { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, ReactNode> = {
    home: <path {...p} d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    inbox: <path {...p} d="M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" />,
    plus: <path {...p} d="M12 5v14M5 12h14" />,
    todo: (
      <g {...p}>
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M8 2v4M16 2v4M3 10h18M8 15l2.5 2.5L16 13" />
      </g>
    ),
    settings: (
      <g {...p}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </g>
    ),
    copy: (
      <g {...p}>
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
      </g>
    ),
    check: <path {...p} d="M4 12.5 9.5 18 20 6.5" />,
    back: <path {...p} d="M15 18 9 12l6-6" />,
    search: (
      <g {...p}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </g>
    ),
    doc: (
      <g {...p}>
        <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </g>
    ),
    pen: <path {...p} d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" />,
    bell: <path {...p} d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />,
    calendar: (
      <g {...p}>
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </g>
    ),
    lock: (
      <g {...p}>
        <rect x="4" y="11" width="16" height="10" rx="2.5" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </g>
    ),
    shield: <path {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    trash: <path {...p} d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
    camera: (
      <g {...p}>
        <path d="M14.5 4h-5L7 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-3z" />
        <circle cx="12" cy="13" r="3.5" />
      </g>
    ),
    alert: <path {...p} d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
    download: <path {...p} d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
    globe: (
      <g {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </g>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
}

export function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? "#fff" : C.ink;
  return (
    <div style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px 0 34px", color, fontFamily: FONT, fontWeight: 700, fontSize: 16 }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="18" height="12" viewBox="0 0 18 12">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={9 - i * 3} width="3.4" height={3 + i * 3} rx="1" fill={color} />
          ))}
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke={color} opacity=".5" />
          <rect x="2.5" y="2.5" width="16" height="7" rx="2" fill={color} />
          <rect x="23.5" y="4" width="2" height="4" rx="1" fill={color} opacity=".5" />
        </svg>
      </span>
    </div>
  );
}

const NAV: { icon: IconName; label: string }[] = [
  { icon: "home", label: "Accueil" },
  { icon: "inbox", label: "Courriers" },
  { icon: "plus", label: "" },
  { icon: "todo", label: "À faire" },
  { icon: "settings", label: "Réglages" },
];

export function BottomNav({ active }: { active: number }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 92, background: "rgba(255,255,255,.96)", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", alignItems: "flex-start", paddingTop: 10, fontFamily: FONT }}>
      {NAV.map((n, i) =>
        n.icon === "plus" ? (
          <div key={i} style={{ width: 54, height: 54, marginTop: -16, borderRadius: 18, background: C.primary, display: "grid", placeItems: "center", boxShadow: "0 8px 18px rgba(31,79,216,.35)" }}>
            <Icon name="plus" size={26} color="#fff" stroke={2.6} />
          </div>
        ) : (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: i === active ? C.primary : C.ink3, fontSize: 11, fontWeight: 700, width: 64 }}>
            <Icon name={n.icon} size={22} />
            {n.label}
          </div>
        ),
      )}
    </div>
  );
}

export function TopBar({ title, back }: { title: string; back?: string }) {
  return (
    <div style={{ padding: "6px 20px 12px", fontFamily: FONT }}>
      {back ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.ink2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          <Icon name="back" size={16} /> {back}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <LogoMark size={26} />
          <span style={{ fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: -0.3 }}>clair</span>
        </div>
      )}
      <div style={{ fontSize: 26, lineHeight: 1.12, fontWeight: 800, color: C.ink, letterSpacing: -0.6 }}>{title}</div>
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.line}`, boxShadow: "0 1px 2px rgba(17,24,39,.04)", ...style }}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "primary" | "warning" | "success" | "danger" }) {
  const t = {
    neutral: [C.surface2, C.ink2],
    primary: [C.primarySoft, C.primary],
    warning: [C.warningSoft, C.warning],
    success: [C.successSoft, C.success],
    danger: [C.dangerSoft, C.danger],
  }[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, background: t[0], color: t[1], fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

export function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: C.ink3, textTransform: "uppercase" }}>{children}</div>;
}

/** Surlignage jaune qui se dessine, signature visuelle de Clair. */
export function Mark({ p, children }: { p: number; children: ReactNode }) {
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${C.mark}, ${C.mark})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 90%",
        backgroundSize: `${p * 100}% 72%`,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
        padding: "0 2px",
      }}
    >
      {children}
    </span>
  );
}

/** Indicateur de toucher : un point qui s'enfonce puis une onde qui s'élargit. */
export function Tap({ x, y, frame, at }: { x: number; y: number; frame: number; at: number }) {
  const t = frame - at;
  if (t < -8 || t > 22) return null;
  const press = interpolate(t, [-8, 0, 6], [0, 1, 0], clamp);
  const ring = interpolate(t, [0, 22], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 50, pointerEvents: "none" }}>
      <div style={{ position: "absolute", width: 44, height: 44, left: -22, top: -22, borderRadius: 30, background: "rgba(17,24,39,.22)", transform: `scale(${0.6 + press * 0.4})`, opacity: press }} />
      <div style={{ position: "absolute", width: 44, height: 44, left: -22, top: -22, borderRadius: 30, border: `3px solid ${C.primary}`, transform: `scale(${1 + ring * 1.4})`, opacity: (1 - ring) * (t >= 0 ? 0.9 : 0) }} />
    </div>
  );
}

/** Téléphone réaliste : cadre, îlot, boutons latéraux, reflets. Le contenu est dessiné en taille logique. */
export function Phone({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const W = SCREEN_W * SCREEN_SCALE;
  const H = SCREEN_H * SCREEN_SCALE;
  const bezel = 16;
  return (
    <div style={{ position: "absolute", width: W + bezel * 2, height: H + bezel * 2, ...style }}>
      {/* boutons latéraux */}
      <div style={{ position: "absolute", left: -5, top: 230, width: 6, height: 70, borderRadius: 3, background: "#1C2230" }} />
      <div style={{ position: "absolute", left: -5, top: 320, width: 6, height: 110, borderRadius: 3, background: "#1C2230" }} />
      <div style={{ position: "absolute", right: -5, top: 300, width: 6, height: 150, borderRadius: 3, background: "#1C2230" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 96,
          background: "linear-gradient(145deg, #2A3142, #0B0F17 40%, #1A2030)",
          boxShadow: "0 60px 120px -30px rgba(17,24,39,.45), 0 30px 60px -20px rgba(17,24,39,.3), inset 0 0 0 2px rgba(255,255,255,.08)",
        }}
      />
      <div style={{ position: "absolute", left: bezel, top: bezel, width: W, height: H, borderRadius: 82, overflow: "hidden", background: C.bg }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W, height: SCREEN_H, transform: `scale(${SCREEN_SCALE})`, transformOrigin: "0 0", fontFamily: FONT, color: C.ink }}>
          {children}
          {/* îlot */}
          <div style={{ position: "absolute", left: "50%", top: 11, width: 112, height: 32, marginLeft: -56, borderRadius: 20, background: "#000", zIndex: 60 }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 82, background: "linear-gradient(115deg, rgba(255,255,255,.10), transparent 30%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}
