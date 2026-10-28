import { useEffect, useState, type ReactNode } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { C, CHAPTERS, EV, FONT, MONO, chapter, clamp, enter, ramp } from "./theme";
import { Icon, LogoMark, Mark, Phone, SCREEN_SCALE, SCREEN_W } from "./ui";
import { ActScreen, EssentialScreen, FindScreen, LettersScreen, PhotoScreen, RemindScreen, UnderstandScreen } from "./screens";

export const EXPLAINER_DURATION = CHAPTERS.reduce((n, c) => n + c.len, 0);

/* Zones sûres TikTok : rien d'important au-dessus de y = 200 ni sous y = 1500, ni à droite de x = 960. */

const STEPS = ["photo", "comprendre", "essentiel", "agir", "rappels", "lettres", "retrouver", "securite"] as const;

type Phase = { at: number; title: string; sub: string };
const CAPTIONS: Record<(typeof STEPS)[number], { name: string; phases: Phase[] }> = {
  photo: { name: "Photographier", phases: [{ at: 0, title: "Une photo suffit.", sub: "Une ou plusieurs pages, ou un PDF : jusqu’à 10 pages par courrier." }] },
  comprendre: {
    name: "Comprendre",
    phases: [{ at: 0, title: "Expliqué en 3 phrases, en français.", sub: "Même si le courrier est en allemand, en italien ou en anglais." }],
  },
  essentiel: {
    name: "L’essentiel",
    phases: [
      { at: 0, title: "Montant, échéance, IBAN.", sub: "Repérés, vérifiés et copiés en un geste." },
      { at: EV.essentiel.review - 6, title: "Un doute ? Clair le signale.", sub: "Ce qui est incertain est marqué « À vérifier »." },
    ],
  },
  agir: {
    name: "Agir",
    phases: [
      { at: 0, title: "La prochaine étape, en premier.", sub: "Un geste pour la marquer comme faite." },
      { at: EV.agir.list - 4, title: "Tout devient une seule liste.", sub: "Triée par urgence : en retard, cette semaine, plus tard." },
    ],
  },
  rappels: {
    name: "Ne rien oublier",
    phases: [
      { at: 0, title: "Un rappel avant chaque échéance.", sub: "Par e-mail, quelques jours avant." },
      { at: EV.rappels.calTap - 6, title: "Et tout dans votre agenda.", sub: "Les échéances s’ajoutent en un clic." },
    ],
  },
  lettres: {
    name: "Répondre",
    phases: [
      { at: 0, title: "La bonne lettre, déjà remplie.", sub: "Résiliation, contestation, délai de paiement, impôts…" },
      { at: EV.lettres.langTap - 8, title: "En français ou en allemand.", sub: "Un PDF prêt à signer et à envoyer." },
    ],
  },
  retrouver: { name: "Tout retrouver", phases: [{ at: 0, title: "Tous vos courriers, au même endroit.", sub: "Retrouvés en une seconde." }] },
  securite: { name: "Sécurité", phases: [{ at: 0, title: "Vos documents restent les vôtres.", sub: "" }] },
};

function Background() {
  // Fond légèrement texturé (grille de points) pour donner de la profondeur sans distraire.
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 0%, #FFFFFF 0%, ${C.bg} 55%, ${C.bg2} 100%)` }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(17,24,39,.07) 1.6px, transparent 1.6px)", backgroundSize: "36px 36px", maskImage: "linear-gradient(to bottom, rgba(0,0,0,.9), rgba(0,0,0,.2))" }} />
    </AbsoluteFill>
  );
}

function Progress({ frame }: { frame: number }) {
  const first = chapter(STEPS[0]).start;
  const last = chapter(STEPS[STEPS.length - 1]).start + chapter(STEPS[STEPS.length - 1]).len;
  const visible = interpolate(frame, [first + 4, first + 16, last - 10, last], [0, 1, 1, 0], clamp);
  const dark = frame >= chapter("securite").start;
  return (
    <div style={{ position: "absolute", left: 80, right: 120, top: 214, display: "flex", gap: 10, opacity: visible }}>
      {STEPS.map((id) => {
        const c = chapter(id);
        const p = interpolate(frame, [c.start, c.start + c.len], [0, 1], clamp);
        return (
          <div key={id} style={{ flex: 1, height: 6, borderRadius: 3, background: dark ? "rgba(255,255,255,.18)" : "rgba(17,24,39,.1)", overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: dark ? C.mark : C.primary }} />
          </div>
        );
      })}
    </div>
  );
}

/** Espaces insécables de la typographie française (avant « : ? ! » et à l'intérieur des guillemets). */
const nb = (t: string) => t.replace(/ ([:;?!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");

/** Titre de chapitre : numéro, nom, phrase forte et précision. Les phrases changent en fondu à chaque phase. */
function Caption({ id, f, len, dark = false }: { id: (typeof STEPS)[number]; f: number; len: number; dark?: boolean }) {
  const cap = CAPTIONS[id];
  const index = STEPS.indexOf(id) + 1;
  const out = interpolate(f, [len - 10, len], [1, 0], clamp);
  const head = enter(f, 2);
  const current = [...cap.phases].reverse().find((p) => f >= p.at) ?? cap.phases[0]!;
  const pIn = enter(f, current.at + (current.at === 0 ? 6 : 0));
  return (
    <div style={{ position: "absolute", left: 80, right: 100, top: 256, fontFamily: FONT, opacity: out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: head, transform: `translateY(${(1 - head) * 16}px)` }}>
        <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: dark ? C.mark : C.primary }}>{String(index).padStart(2, "0")}</span>
        <span style={{ width: 40, height: 3, borderRadius: 2, background: dark ? C.mark : C.primary }} />
        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: dark ? "rgba(255,255,255,.8)" : C.ink2 }}>{cap.name}</span>
      </div>
      <div key={current.title} style={{ marginTop: 22 }}>
        <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2.2, color: dark ? "#fff" : C.ink, opacity: pIn, transform: `translateY(${(1 - pIn) * 28}px)`, textWrap: "balance" }}>{nb(current.title)}</div>
        {current.sub ? (
          <div style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.3, color: dark ? "rgba(255,255,255,.75)" : C.ink2, marginTop: 16, opacity: enter(f, current.at + 8), textWrap: "balance" }}>{nb(current.sub)}</div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Caméra : pour chaque chapitre, des points-clés [image locale, zoom, haut de la zone cadrée (en px logiques)].
 * Le zoom maximal (1,38) garde l'écran loin des boutons TikTok à droite ; la zone cadrée reste au-dessus de y = 1500.
 */
const CAMERA: Record<string, [number, number, number][]> = {
  photo: [[0, 1.02, 0]],
  comprendre: [
    [0, 1.2, 40],
    [80, 1.2, 40],
    [96, 1.38, 60],
  ],
  essentiel: [[0, 1.36, 44]],
  agir: [
    [0, 1.38, 60],
    [96, 1.38, 60],
    [112, 1.3, 44],
  ],
  rappels: [
    [0, 1.38, 44],
    [92, 1.38, 44],
    [108, 1.3, 150],
  ],
  lettres: [
    [0, 1.35, 40],
    [70, 1.35, 40],
    [84, 1.36, 40],
    [186, 1.36, 40],
    [200, 1.38, 64],
  ],
  retrouver: [[0, 1.38, 40]],
};

function cameraAt(frame: number) {
  const keys = Object.entries(CAMERA).flatMap(([id, ks]) => ks.map(([f, s, a]) => [chapter(id).start + f, s, a] as const));
  keys.sort((x, y) => x[0] - y[0]);
  const frames = keys.map((k) => k[0]);
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const lerp = (i: 1 | 2) => (keys.length === 1 ? keys[0]![i] : interpolate(frame, frames, keys.map((k) => k[i]), { ...clamp, easing: ease }));
  return { scale: lerp(1), focus: lerp(2) };
}

/** Le téléphone reste à l'écran de la photo jusqu'à la recherche ; son contenu change avec les chapitres. */
function PhoneStage({ frame }: { frame: number }) {
  const startId = "photo";
  const endId = "retrouver";
  const from = chapter(startId).start;
  const to = chapter(endId).start + chapter(endId).len;
  const inP = enter(frame, from + 4, 30, 22);
  const outP = interpolate(frame, [to - 12, to], [0, 1], clamp);
  const ids = STEPS.slice(0, STEPS.indexOf(endId) + 1);
  const idx = ids.findIndex((id) => frame >= chapter(id).start && frame < chapter(id).start + chapter(id).len);
  if (idx < 0) return null;
  const render = (id: string, f: number) => {
    switch (id) {
      case "photo":
        return <PhotoScreen f={f} />;
      case "comprendre":
        return <UnderstandScreen f={f} />;
      case "essentiel":
        return <EssentialScreen f={f} />;
      case "agir":
        return <ActScreen f={f} />;
      case "rappels":
        return <RemindScreen f={f} />;
      case "lettres":
        return <LettersScreen f={f} />;
      default:
        return <FindScreen f={f} />;
    }
  };
  const id = ids[idx]!;
  const c = chapter(id);
  const local = frame - c.start;
  const swap = ramp(local, 0, 14);
  const prev = idx > 0 && local < 14 ? ids[idx - 1]! : null;
  const W = SCREEN_W * SCREEN_SCALE + 32;
  const float = Math.sin(frame / 40) * 5;
  const cam = cameraAt(frame);
  // Fenêtre sous le titre : le haut du téléphone s'efface en dégradé quand la caméra zoome.
  const WINDOW_TOP = 600;
  const target = 56;
  const ty = target - (16 + cam.focus * SCREEN_SCALE) * cam.scale;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: WINDOW_TOP, bottom: 0, overflow: "hidden", maskImage: "linear-gradient(to bottom, transparent 0, #000 46px)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 46px)" }}>
      <Phone
        style={{
          left: (1080 - W) / 2,
          top: 0,
          transformOrigin: "50% 0",
          transform: `translateY(${ty + (1 - inP) * 1100 + outP * 80 + float}px) scale(${cam.scale * (1 - outP * 0.08)})`,
          opacity: 1 - outP,
        }}
      >
        {prev ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-swap * 30}%)`, opacity: 1 - swap }}>{render(prev, chapter(prev).len - 1)}</div>
        ) : null}
        <div style={{ position: "absolute", inset: 0, transform: prev ? `translateX(${(1 - swap) * 100}%)` : "none" }}>{render(id, local)}</div>
      </Phone>
    </div>
  );
}

/** Volet de transition aux couleurs de Clair (bleu puis jaune) qui balaie l'écran de bas en haut. */
function Wipe({ frame, at }: { frame: number; at: number }) {
  const p = interpolate(frame, [at - 12, at + 12], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const y = (k: number) => interpolate(p, [0, 0.5, 1], [100, 0, -100].map((v) => v + k));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: C.mark, transform: `translateY(${y(12)}%)` }} />
      <AbsoluteFill style={{ background: C.primary, transform: `translateY(${y(0)}%)` }} />
    </AbsoluteFill>
  );
}

/* ---------- Accroche ---------- */
function Hook({ f }: { f: number }) {
  const swap = EV.hook.swap;
  const a = interpolate(f, [swap - 6, swap], [1, 0], clamp);
  const b = enter(f, swap + 2);
  const mark = ramp(f, swap + 12, swap + 30);
  const letters = [
    { t: "Rechnung", s: "Zahlbar innert 30 Tagen", x: 140, y: 820, r: -8 },
    { t: "Zahlungsbefehl", s: "Rechtsvorschlag innert 10 Tagen", x: 300, y: 930, r: 4 },
    { t: "Prämienmitteilung 2027", s: "Grundversicherung KVG", x: 200, y: 1070, r: -3 },
  ];
  return (
    <AbsoluteFill style={{ background: C.night, fontFamily: FONT }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 62%, rgba(31,79,216,.35), transparent 70%)" }} />
      {letters.map((l, i) => {
        const drift = f * (0.35 + i * 0.12);
        return (
          <div
            key={l.t}
            style={{
              position: "absolute",
              left: l.x,
              top: l.y - drift,
              width: 640,
              padding: "34px 38px",
              borderRadius: 14,
              background: "#FBFBF9",
              color: "#374151",
              fontFamily: MONO,
              transform: `rotate(${l.r + Math.sin((f + i * 20) / 30) * 1.2}deg)`,
              boxShadow: "0 40px 80px rgba(0,0,0,.5)",
              opacity: 0.92 - i * 0.04,
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 700, color: "#111827" }}>{l.t}</div>
            <div style={{ fontSize: 24, marginTop: 10 }}>{l.s}</div>
            <div style={{ height: 10, width: "80%", background: "#E5E7EB", borderRadius: 5, marginTop: 22 }} />
            <div style={{ height: 10, width: "55%", background: "#E5E7EB", borderRadius: 5, marginTop: 14 }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 80, right: 100, top: 250 }}>
        <div style={{ opacity: a, position: "absolute", left: 0, right: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: C.mark }}>Courrier administratif</div>
          <div style={{ fontSize: 96, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1.02, marginTop: 18 }}>
            Ce courrier,
            <br />
            vous le comprenez ?
          </div>
        </div>
        <div style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px)`, position: "absolute", left: 0, right: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: C.mark }}>Clair</div>
          <div style={{ fontSize: 96, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1.02, marginTop: 18 }}>
            Il vous l’explique.
            <br />
            <span style={{ position: "relative", display: "inline-block" }}>
              <span>Et bien plus.</span>
              <span style={{ position: "absolute", inset: "0 -10px", background: C.mark, color: C.ink, padding: "0 10px", clipPath: `inset(0 ${(1 - mark) * 100}% 0 0)` }}>Et bien plus.</span>
            </span>
          </div>
          <div style={{ fontSize: 38, fontWeight: 600, color: "rgba(255,255,255,.75)", marginTop: 26 }}>Voici tout ce que fait Clair, en une minute.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 08 Sécurité ---------- */
function Security({ f }: { f: number }) {
  const e = EV.securite;
  const c = chapter("securite");
  const lock = ramp(f, e.lock, e.lock + 26);
  const rows: [Parameters<typeof Icon>[0]["name"], string, string][] = [
    ["lock", "Chiffrés avant d’être stockés", "AES-256, comme les banques"],
    ["shield", "Aucune publicité, aucune revente", "Vos données servent uniquement à vous aider"],
    ["trash", "Exportées ou supprimées en un clic", "Vous gardez le contrôle, à tout moment"],
  ];
  const langs = enter(f, e.langs);
  return (
    <AbsoluteFill style={{ background: C.night, fontFamily: FONT }}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 55%, rgba(31,79,216,.35), transparent 70%)" }} />
      <Caption id="securite" f={f} len={c.len} dark />
      <svg width="190" height="190" viewBox="0 0 24 24" style={{ position: "absolute", left: 80, top: 520 }}>
        <rect x="4" y="11" width="16" height="10" rx="2.5" fill="none" stroke={C.mark} strokeWidth="1.6" strokeDasharray="60" strokeDashoffset={60 * (1 - lock)} />
        <path d={`M8 11V7a4 4 0 0 1 8 0v4`} fill="none" stroke={C.mark} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="30" strokeDashoffset={30 * (1 - lock)} transform={`translate(0 ${(1 - lock) * -1.5})`} />
        <circle cx="12" cy="16" r="1.3" fill={C.mark} opacity={lock} />
      </svg>
      <div style={{ position: "absolute", left: 80, right: 100, top: 760 }}>
        {rows.map(([icon, t, s], i) => {
          const p = enter(f, [e.row0, e.row1, e.row2][i]!);
          return (
            <div key={t} style={{ display: "flex", gap: 26, alignItems: "center", padding: "26px 0", borderTop: "1px solid rgba(255,255,255,.12)", opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>
              <div style={{ width: 76, height: 76, borderRadius: 22, background: "rgba(255,255,255,.08)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={icon} size={38} color="#fff" stroke={2} />
              </div>
              <div>
                <div style={{ fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: -0.8 }}>{t}</div>
                <div style={{ fontSize: 30, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{s}</div>
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 34, opacity: langs, transform: `translateY(${(1 - langs) * 20}px)` }}>
          <Icon name="globe" size={40} color={C.mark} />
          <span style={{ fontSize: 34, fontWeight: 700, color: "#fff" }}>Interface en</span>
          {["Français", "Deutsch", "English"].map((l) => (
            <span key={l} style={{ padding: "8px 18px", borderRadius: 30, border: "2px solid rgba(255,255,255,.4)", color: "#fff", fontSize: 28, fontWeight: 700 }}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- Fin ---------- */
function End({ f }: { f: number }) {
  const e = EV.fin;
  const free = enter(f, 0);
  const freeMark = ramp(f, 10, 30);
  const logo = enter(f, e.logo, 30, 13);
  const soon = enter(f, e.soon);
  const pills = [enter(f, e.platforms, 30, 14), enter(f, e.platforms + 6, 30, 14)];
  const follow = enter(f, e.follow);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center" }}>
      <div style={{ position: "absolute", top: 250, left: 80, right: 80, textAlign: "center", opacity: free, transform: `translateY(${(1 - free) * 30}px)` }}>
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, color: C.ink }}>
          <Mark p={freeMark}>Gratuit</Mark> pendant la bêta
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, color: C.ink2, marginTop: 14 }}>5 analyses automatiques par mois · lettres et échéances illimitées</div>
      </div>
      <div style={{ position: "absolute", top: 590, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${0.5 + logo * 0.5}) rotate(${(1 - logo) * -14}deg)`, opacity: logo }}>
          <LogoMark size={200} />
        </div>
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -6, color: C.ink, marginTop: 6, opacity: logo }}>clair</div>
        <div style={{ fontSize: 44, fontWeight: 600, color: C.ink2, opacity: enter(f, e.logo + 12) }}>Votre courrier administratif, enfin clair.</div>
      </div>
      <div style={{ position: "absolute", top: 1150, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: C.ink, letterSpacing: 2, textTransform: "uppercase", opacity: soon, transform: `translateY(${(1 - soon) * 20}px)` }}>Bientôt disponible sur</div>
        <div style={{ display: "flex", gap: 26 }}>
          {["iOS", "Android"].map((p, i) => (
            <div key={p} style={{ padding: "22px 58px", borderRadius: 28, background: C.ink, color: "#fff", fontSize: 60, fontWeight: 800, letterSpacing: -1, opacity: pills[i], transform: `translateY(${(1 - pills[i]!) * 40}px) scale(${0.9 + pills[i]! * 0.1})`, boxShadow: "0 20px 40px -10px rgba(17,24,39,.45)" }}>
              {p}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.primary, opacity: follow, marginTop: 10 }}>Abonnez-vous pour ne pas rater le lancement</div>
      </div>
    </AbsoluteFill>
  );
}

function Scene({ id, children }: { id: string; children: (f: number) => ReactNode }) {
  const c = chapter(id);
  const frame = useCurrentFrame();
  return (
    <Sequence from={c.start} durationInFrames={c.len}>
      {children(frame - c.start)}
    </Sequence>
  );
}

export function ClairExplainer() {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("Police Manrope"));
  useEffect(() => {
    Promise.all([document.fonts.load(`800 100px "Manrope Variable"`), document.fonts.load(`600 40px "Manrope Variable"`)]).finally(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Background />
      {STEPS.filter((id) => id !== "securite").map((id) => (
        <Scene key={id} id={id}>
          {(f) => <Caption id={id} f={f} len={chapter(id).len} />}
        </Scene>
      ))}
      <PhoneStage frame={frame} />
      <Scene id="hook">{(f) => <Hook f={f} />}</Scene>
      <Scene id="securite">{(f) => <Security f={f} />}</Scene>
      <Scene id="fin">{(f) => <End f={f} />}</Scene>
      <Progress frame={frame} />
      <Wipe frame={frame} at={chapter("photo").start} />
      <Wipe frame={frame} at={chapter("securite").start} />
      <Wipe frame={frame} at={chapter("fin").start} />
    </AbsoluteFill>
  );
}
