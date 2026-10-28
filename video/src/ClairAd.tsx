import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AbsoluteFill, Easing, Sequence, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, type Lang } from "./copy";

export type AdProps = { lang: Lang };

/** Durée totale : 25 s à 30 images par seconde. */
export const DURATION = 750;

// Couleurs et typographie de Clair (DESIGN_SYSTEM.md).
const C = {
  ink: "#111827",
  ink2: "#4B5563",
  ink3: "#6B7280",
  bg: "#F4F5F7",
  surface: "#FFFFFF",
  line: "#E3E6EB",
  primary: "#1F4FD8",
  primarySoft: "#E6ECFC",
  mark: "#FFD84D",
  success: "#176C41",
};
const FONT = '"Manrope Variable", "Manrope", system-ui, sans-serif';
const MONO = '"DejaVu Sans Mono", ui-monospace, Menlo, monospace';

// Zones sûres TikTok : le texte important reste entre y = 200 et y = 1500, et loin du bord droit.
const SCENES = { hook: [0, 96], snap: [96, 114], explain: [210, 210], beats: [420, 126], langs: [546, 90], end: [636, 114] } as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function useEnter(delay = 0, damping = 18) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
}

/** Sortie douce sur les dernières images d'une scène. */
function useExit(length: number, frames = 8) {
  const frame = useCurrentFrame();
  return interpolate(frame, [length - frames, length], [1, 0], clamp);
}

/** Surlignage jaune, signature visuelle de Clair. */
function Mark({ progress, children, color = C.ink }: { progress: number; children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        color,
        backgroundImage: `linear-gradient(${C.mark}, ${C.mark})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        backgroundSize: `${progress * 100}% 78%`,
        padding: "0 0.12em",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Surlignage sur fond sombre : le texte reste blanc, puis la bande jaune balaie de gauche à droite
 * en révélant le même texte en encre (jamais de texte foncé sur fond foncé).
 */
function MarkReveal({ progress, children }: { progress: number; children: ReactNode }) {
  return (
    <span style={{ position: "relative", display: "inline-block", color: "#fff", padding: "0 0.14em" }}>
      {children}
      <span
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, padding: "0 0.14em", background: C.mark, color: C.ink, clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}
      >
        {children}
      </span>
    </span>
  );
}

function LogoMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
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

/* ---------- 1. Accroche ---------- */
function Hook({ lang }: AdProps) {
  const t = COPY[lang];
  const frame = useCurrentFrame();
  // La première image doit déjà montrer la question : c'est elle qui arrête le défilement.
  const line1 = 1;
  const line2 = 1;
  const sweep = interpolate(frame, [22, 44], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const exit = useExit(SCENES.hook[1]);
  const cards = [
    { x: 90, y: 260, r: -9, s: 0 },
    { x: 560, y: 420, r: 7, s: 6 },
    { x: 120, y: 1230, r: 5, s: 10 },
    { x: 520, y: 1380, r: -6, s: 3 },
  ];
  return (
    <AbsoluteFill style={{ background: C.ink, opacity: exit }}>
      {cards.map((c, i) => {
        const appear = appearAt(frame, c.s);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y - frame * 0.9,
              width: 420,
              padding: "26px 30px",
              borderRadius: 18,
              background: "#1F2937",
              color: "#D1D5DB",
              fontFamily: MONO,
              fontSize: 30,
              transform: `rotate(${c.r + frame * 0.03 * (i % 2 ? 1 : -1)}deg) scale(${0.9 + appear * 0.1})`,
              opacity: 0.55 * appear,
              filter: "blur(1.5px)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 14 }}>{t.pile[i]}</div>
            <div style={{ height: 10, width: "80%", background: "#374151", borderRadius: 5, marginBottom: 10 }} />
            <div style={{ height: 10, width: "60%", background: "#374151", borderRadius: 5 }} />
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px", fontFamily: FONT, transform: `scale(${1 + (1 - exit) * 0.06})` }}>
        <div style={{ color: "#fff", fontSize: 88, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5 }}>
          <div style={{ transform: `translateY(${(1 - line1) * 60}px)`, opacity: line1 }}>{t.hook[0]}</div>
          <div style={{ transform: `translateY(${(1 - line2) * 60}px)`, opacity: line2, marginTop: 10 }}>
            <MarkReveal progress={sweep}>{t.hook[1]}</MarkReveal>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// Apparition des cartes de fond (simple interpolation, utilisable dans une boucle).
function appearAt(frame: number, delay: number) {
  return interpolate(frame, [delay, delay + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
}

/* ---------- 2. La photo ---------- */
function Paper({ lang, style }: AdProps & { style?: CSSProperties }) {
  const t = COPY[lang].letter;
  return (
    <div
      style={{
        width: 640,
        padding: "56px 54px",
        background: C.surface,
        borderRadius: 10,
        boxShadow: "0 30px 80px rgba(17,24,39,.18)",
        fontFamily: MONO,
        color: C.ink2,
        ...style,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.ink3 }}>{t.sender}</div>
      <div style={{ height: 2, background: C.line, margin: "28px 0" }} />
      {t.lines.slice(0, 3).map((l) => (
        <div key={l} style={{ fontSize: 30, lineHeight: 1.6 }}>
          {l}
        </div>
      ))}
      <div style={{ fontSize: 54, fontWeight: 700, color: C.ink, marginTop: 16 }}>{t.lines[3]}</div>
      {[90, 75, 82, 60].map((w, i) => (
        <div key={i} style={{ height: 12, width: `${w}%`, background: "#EEF0F3", borderRadius: 6, marginTop: 22 }} />
      ))}
    </div>
  );
}

function Snap({ lang }: AdProps) {
  const t = COPY[lang];
  const frame = useCurrentFrame();
  const title = useEnter(2);
  const phone = useEnter(18, 16);
  const flash = interpolate(frame, [72, 74, 86], [0, 1, 0], clamp);
  const pulse = interpolate(frame, [72, 78, 90], [1, 0.97, 1], clamp);
  const exit = useExit(SCENES.snap[1]);
  const corner = (pos: CSSProperties) => (
    <div style={{ position: "absolute", width: 70, height: 70, borderColor: "#fff", borderStyle: "solid", borderWidth: 0, ...pos }} />
  );
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: exit }}>
      <div style={{ position: "absolute", top: 230, left: 80, right: 80, fontFamily: FONT, fontSize: 88, fontWeight: 800, color: C.ink, letterSpacing: -1.5, opacity: title, transform: `translateY(${(1 - title) * 40}px)` }}>
        {t.snap}
      </div>
      <Paper lang={lang} style={{ position: "absolute", left: 220, top: 560, transform: `rotate(-3deg) scale(${pulse})` }} />
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 440 + (1 - phone) * 1300,
          width: 700,
          height: 1180,
          borderRadius: 90,
          border: `22px solid ${C.ink}`,
          boxShadow: "0 40px 120px rgba(17,24,39,.35)",
          transform: `scale(${pulse})`,
        }}
      >
        <div style={{ position: "absolute", inset: 70 }}>
          {corner({ left: 0, top: 0, borderLeftWidth: 8, borderTopWidth: 8, borderTopLeftRadius: 18 })}
          {corner({ right: 0, top: 0, borderRightWidth: 8, borderTopWidth: 8, borderTopRightRadius: 18 })}
          {corner({ left: 0, bottom: 0, borderLeftWidth: 8, borderBottomWidth: 8, borderBottomLeftRadius: 18 })}
          {corner({ right: 0, bottom: 0, borderRightWidth: 8, borderBottomWidth: 8, borderBottomRightRadius: 18 })}
        </div>
        <div style={{ position: "absolute", bottom: 40, left: "50%", width: 120, height: 120, marginLeft: -60, borderRadius: 60, background: "#fff", border: `10px solid rgba(17,24,39,.25)` }} />
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
}

/* ---------- 3. L'explication ---------- */
function Explain({ lang }: AdProps) {
  const t = COPY[lang];
  const frame = useCurrentFrame();
  const title = useEnter(0);
  const sub = useEnter(8);
  const phone = useEnter(4, 20);
  const chars = Math.round(interpolate(frame, [22, 78], [0, t.summary.length], clamp));
  const actionIn = useEnter(84);
  const sweep = interpolate(frame, [96, 122], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const card = useEnter(128, 16);
  const press = interpolate(frame, [178, 184, 192], [1, 0.94, 1], clamp);
  const exit = useExit(SCENES.explain[1]);
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: exit, fontFamily: FONT }}>
      <div style={{ position: "absolute", top: 190, left: 80, right: 80 }}>
        <div style={{ fontSize: 84, fontWeight: 800, color: C.ink, letterSpacing: -1.5, opacity: title, transform: `translateY(${(1 - title) * 40}px)` }}>{t.explain}</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.primary, marginTop: 6, opacity: sub }}>{t.explainSub}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 170,
          top: 470 + (1 - phone) * 300,
          width: 740,
          height: 1300,
          borderRadius: 92,
          border: `20px solid ${C.ink}`,
          background: C.bg,
          overflow: "hidden",
          opacity: phone,
          boxShadow: "0 40px 120px rgba(17,24,39,.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "56px 48px 30px" }}>
          <LogoMark size={56} />
          <span style={{ fontSize: 42, fontWeight: 800, color: C.ink }}>clair</span>
        </div>
        <div style={{ margin: "0 36px", padding: "34px 38px", background: C.surface, borderRadius: 30, border: `2px solid ${C.line}` }}>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 3, color: C.ink3, textTransform: "uppercase" }}>{t.summaryLabel}</div>
          <div style={{ fontSize: 38, lineHeight: 1.42, fontWeight: 600, color: C.ink, marginTop: 14, minHeight: 162 }}>
            {t.summary.slice(0, chars)}
            {chars < t.summary.length ? <span style={{ color: C.primary }}>|</span> : null}
          </div>
          <div style={{ fontSize: 36, lineHeight: 1.45, fontWeight: 700, marginTop: 22, opacity: actionIn, transform: `translateY(${(1 - actionIn) * 20}px)` }}>
            <Mark progress={sweep}>{t.action}</Mark>
          </div>
        </div>
        <div
          style={{
            margin: "28px 36px 0",
            background: C.surface,
            borderRadius: 30,
            border: `3px solid rgba(31,79,216,.45)`,
            overflow: "hidden",
            opacity: card,
            transform: `translateY(${(1 - card) * 80}px)`,
          }}
        >
          <div style={{ background: C.primarySoft, color: C.primary, fontSize: 24, fontWeight: 800, letterSpacing: 3, padding: "16px 38px", textTransform: "uppercase" }}>{t.nextStep}</div>
          <div style={{ padding: "26px 38px 34px" }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: C.ink }}>{t.nextTitle}</div>
            <div style={{ display: "inline-block", marginTop: 14, padding: "6px 18px", borderRadius: 40, background: "#FDF3D7", color: "#8A5A00", fontSize: 28, fontWeight: 700 }}>{t.badge}</div>
            <div style={{ marginTop: 26, display: "inline-block", padding: "20px 34px", borderRadius: 22, background: C.primary, color: "#fff", fontSize: 34, fontWeight: 800, transform: `scale(${press})` }}>{t.button}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 4. Trois promesses ---------- */
function BeatIcon({ index, progress }: { index: number; progress: number }) {
  const stroke = { fill: "none", stroke: "#fff", strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (index === 0) {
    return (
      <svg width="200" height="200" viewBox="0 0 100 100">
        <rect x="22" y="10" width="56" height="80" rx="8" {...stroke} strokeWidth={6} />
        {[30, 44, 58].map((y, i) => (
          <line key={y} x1="34" y1={y} x2={34 + 32 * interpolate(progress, [i * 0.2, i * 0.2 + 0.5], [0, 1], clamp)} y2={y} {...stroke} strokeWidth={6} stroke={i === 1 ? C.mark : "#fff"} />
        ))}
      </svg>
    );
  }
  if (index === 1) {
    const len = 60;
    return (
      <svg width="200" height="200" viewBox="0 0 100 100">
        <rect x="14" y="14" width="72" height="72" rx="18" {...stroke} strokeWidth={6} />
        <path d="M30 52 L45 66 L71 36" {...stroke} stroke={C.mark} strokeDasharray={len} strokeDashoffset={len * (1 - progress)} />
      </svg>
    );
  }
  return (
    <svg width="200" height="200" viewBox="0 0 100 100">
      <path d="M20 14h42l18 18v54H20z" {...stroke} strokeWidth={6} />
      <path d="M30 70 Q42 56 50 66 T70 60" {...stroke} stroke={C.mark} strokeDasharray={70} strokeDashoffset={70 * (1 - progress)} strokeWidth={6} />
    </svg>
  );
}

function Beat({ lang, index }: AdProps & { index: number }) {
  const [word, sub] = COPY[lang].beats[index]!;
  const frame = useCurrentFrame();
  const enter = useEnter(0, 15);
  const icon = interpolate(frame, [6, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const exit = interpolate(frame, [36, 42], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", padding: "0 90px", fontFamily: FONT }}>
      <div style={{ transform: `translateX(${(1 - enter) * 300 - exit * 300}px)`, opacity: enter * (1 - exit) }}>
        <BeatIcon index={index} progress={icon} />
        <div style={{ fontSize: 124, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1.02, marginTop: 30 }}>{word}</div>
        <div style={{ fontSize: 50, fontWeight: 600, color: "rgba(255,255,255,.82)", marginTop: 22, maxWidth: 820, lineHeight: 1.3 }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
}

function Beats({ lang }: AdProps) {
  return (
    <AbsoluteFill style={{ background: C.primary }}>
      {[0, 1, 2].map((i) => (
        <Sequence key={i} from={i * 42} durationInFrames={42}>
          <Beat lang={lang} index={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

/* ---------- 5. Les langues ---------- */
function Langs({ lang }: AdProps) {
  const t = COPY[lang];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const merge = interpolate(frame, [34, 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const result = useEnter(46);
  const sweep = interpolate(frame, [58, 76], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const exit = useExit(SCENES.langs[1]);
  const foreign = t.langs.slice(0, 3);
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: FONT, opacity: exit }}>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 28 }}>
        {foreign.map((l, i) => {
          const s = spring({ frame: frame - i * 6, fps, config: { damping: 14 } });
          return (
            <div
              key={l}
              style={{
                padding: "22px 34px",
                borderRadius: 60,
                border: "4px solid rgba(255,255,255,.7)",
                color: "#fff",
                fontSize: 46,
                fontWeight: 700,
                opacity: s * (1 - merge),
                transform: `translateY(${(1 - s) * 60 + merge * 260}px) translateX(${(1 - i) * merge * 260}px) scale(${1 - merge * 0.5})`,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
      <svg width="120" height="200" viewBox="0 0 60 100" style={{ position: "absolute", left: 480, top: 540, opacity: merge }}>
        <path d="M30 6 V80 M12 62 L30 82 L48 62" fill="none" stroke={C.mark} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", top: 820, left: 80, right: 80, textAlign: "center", opacity: result, transform: `translateY(${(1 - result) * 50}px)` }}>
        <div style={{ fontSize: 86, fontWeight: 800, color: "#fff", letterSpacing: -1.5, lineHeight: 1.1 }}>{t.langsResult[0]}</div>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2, marginTop: 14 }}>
          <MarkReveal progress={sweep}>{t.langsResult[1]}</MarkReveal>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 6. Fin : bientôt sur iOS et Android ---------- */
function Platform({ label, delay }: { label: string; delay: number }) {
  const s = useEnter(delay, 14);
  return (
    <div style={{ padding: "22px 54px", borderRadius: 26, background: C.ink, color: "#fff", fontSize: 58, fontWeight: 800, letterSpacing: -0.5, opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
      {label}
    </div>
  );
}

function End({ lang }: AdProps) {
  const t = COPY[lang];
  const logo = useEnter(0, 12);
  const word = useEnter(8);
  const tag = useEnter(16);
  const soon = useEnter(34);
  const follow = useEnter(62);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, alignItems: "center" }}>
      <div style={{ marginTop: 330, transform: `scale(${0.6 + logo * 0.4}) rotate(${(1 - logo) * -12}deg)`, opacity: logo }}>
        <LogoMark size={210} />
      </div>
      <div style={{ fontSize: 150, fontWeight: 800, color: C.ink, letterSpacing: -5, marginTop: 10, opacity: word, transform: `translateY(${(1 - word) * 30}px)` }}>clair</div>
      <div style={{ fontSize: 48, fontWeight: 600, color: C.ink2, textAlign: "center", padding: "0 70px", lineHeight: 1.3, textWrap: "balance", opacity: tag }}>{t.tagline}</div>
      <div style={{ marginTop: 90, fontSize: 52, fontWeight: 800, color: C.ink, opacity: soon }}>
        <Mark progress={soon}>{t.soon}</Mark>
      </div>
      <div style={{ display: "flex", gap: 30, marginTop: 36 }}>
        <Platform label="iOS" delay={42} />
        <Platform label="Android" delay={48} />
      </div>
      <div style={{ marginTop: 60, fontSize: 38, fontWeight: 700, color: C.primary, textAlign: "center", padding: "0 120px", opacity: follow }}>{t.follow}</div>
    </AbsoluteFill>
  );
}

export function ClairAd({ lang }: AdProps) {
  const [handle] = useState(() => delayRender("Chargement de la police Manrope"));
  useEffect(() => {
    Promise.all([document.fonts.load(`800 100px "Manrope Variable"`), document.fonts.load(`600 40px "Manrope Variable"`)])
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
  const seq = (key: keyof typeof SCENES, node: ReactNode) => (
    <Sequence from={SCENES[key][0]} durationInFrames={SCENES[key][1]}>
      {node}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {seq("hook", <Hook lang={lang} />)}
      {seq("snap", <Snap lang={lang} />)}
      {seq("explain", <Explain lang={lang} />)}
      {seq("beats", <Beats lang={lang} />)}
      {seq("langs", <Langs lang={lang} />)}
      {seq("end", <End lang={lang} />)}
    </AbsoluteFill>
  );
}
