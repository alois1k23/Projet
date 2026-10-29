import { useEffect, useState, type ReactNode } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, Sequence, useCurrentFrame } from "remotion";
import { C, FONT, MONO, clamp, enter, ramp, typed } from "../explainer/theme";
import { Badge, Card, Icon, Label, LogoMark, Mark, Phone, SCREEN_SCALE, SCREEN_W, StatusBar, Tap, TopBar } from "../explainer/ui";
import CUES from "./cues.json";

/*
 * Deuxième vidéo TikTok : changer de caisse-maladie avant le 30 novembre.
 * Faits vérifiés (ch.ch, LAMal art. 7) : résiliation REÇUE au plus tard le 30 novembre,
 * l'ancienne caisse libère l'assuré quand la nouvelle confirme l'affiliation, prestations de base identiques.
 * Les primes affichées sont des exemples fictifs, signalés comme tels.
 */

export const LAMAL_DURATION = CUES.duration;
const ch = (id: string) => CUES.chapters.find((c) => c.id === id)!;
const EV = CUES.events;
const nb = (t: string) => t.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ");
const rise = (p: number, d = 30) => ({ opacity: p, transform: `translateY(${(1 - p) * d}px)` });

const STEPS = ["regle", "comparer", "assurer", "resilier", "envoyer", "clair"] as const;
type StepId = (typeof STEPS)[number];
const CAPTIONS: Record<StepId, { label: string; num?: string; title: string; sub: string }> = {
  regle: { label: "La règle", title: "La date qui compte : le 30 novembre.", sub: "Votre résiliation doit être reçue par la caisse ce jour-là au plus tard. Pas envoyée : reçue." },
  comparer: { label: "Comparer", num: "01", title: "Même assurance, prix différents.", sub: "L’assurance de base rembourse la même chose partout. Comparateur officiel : priminfo.admin.ch" },
  assurer: { label: "S’inscrire ailleurs", num: "02", title: "D’abord la nouvelle caisse.", sub: "L’ancienne vous libère dès que la nouvelle confirme votre affiliation." },
  resilier: { label: "Résilier", num: "03", title: "Une lettre simple suffit.", sub: "Signée par chaque adulte concerné." },
  envoyer: { label: "Envoyer", num: "04", title: "En recommandé, quelques jours avant.", sub: "Gardez le récépissé : c’est votre preuve." },
  clair: { label: "Avec Clair", title: "Ou laissez Clair s’en occuper.", sub: "Il lit l’annonce, calcule la hausse, vous rappelle la date et prépare la lettre." },
};

function Background() {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 0%, #FFFFFF 0%, ${C.bg} 55%, ${C.bg2} 100%)` }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(17,24,39,.07) 1.6px, transparent 1.6px)", backgroundSize: "36px 36px", maskImage: "linear-gradient(to bottom, rgba(0,0,0,.9), rgba(0,0,0,.2))" }} />
    </AbsoluteFill>
  );
}

function Progress({ frame }: { frame: number }) {
  const first = ch(STEPS[0]).start;
  const lastC = ch(STEPS[STEPS.length - 1]);
  const vis = interpolate(frame, [first + 4, first + 16, lastC.start + lastC.len - 10, lastC.start + lastC.len], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 80, right: 120, top: 214, display: "flex", gap: 10, opacity: vis }}>
      {STEPS.map((id) => {
        const c = ch(id);
        const p = interpolate(frame, [c.start, c.start + c.len], [0, 1], clamp);
        return (
          <div key={id} style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(17,24,39,.1)", overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: C.primary }} />
          </div>
        );
      })}
    </div>
  );
}

function Caption({ id, f, len }: { id: StepId; f: number; len: number }) {
  const cap = CAPTIONS[id];
  const out = interpolate(f, [len - 10, len], [1, 0], clamp);
  const head = enter(f, 2);
  const title = enter(f, 6);
  const sub = enter(f, 14);
  return (
    <div style={{ position: "absolute", left: 80, right: 100, top: 256, fontFamily: FONT, opacity: out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, ...rise(head, 16) }}>
        {cap.num ? <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.primary }}>{cap.num}</span> : null}
        <span style={{ width: 40, height: 3, borderRadius: 2, background: C.primary }} />
        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: C.ink2 }}>{cap.label}</span>
      </div>
      <div style={{ marginTop: 22, fontSize: 74, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2.2, color: C.ink, textWrap: "balance", ...rise(title, 28) }}>{nb(cap.title)}</div>
      <div style={{ marginTop: 16, fontSize: 36, fontWeight: 600, lineHeight: 1.3, color: C.ink2, textWrap: "balance", opacity: sub }}>{nb(cap.sub)}</div>
    </div>
  );
}

function Wipe({ frame, at }: { frame: number; at: number }) {
  const p = interpolate(frame, [at - 12, at + 12], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const y = (k: number) => interpolate(p, [0, 0.5, 1], [100 + k, k, -100 + k]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: C.mark, transform: `translateY(${y(12)}%)` }} />
      <AbsoluteFill style={{ background: C.primary, transform: `translateY(${y(0)}%)` }} />
    </AbsoluteFill>
  );
}

/** Zone d'illustration sous le titre (entre y = 640 et y = 1460, au-dessus de la légende TikTok). */
function Stage({ children, f, len }: { children: ReactNode; f: number; len: number }) {
  const out = interpolate(f, [len - 10, len], [1, 0], clamp);
  // Contenu dessiné sur 765 px de large puis agrandi (×1,15) : 880 px à l'écran, loin des boutons TikTok.
  return (
    <div style={{ position: "absolute", left: 80, top: 740, width: 765, height: 640, fontFamily: FONT, opacity: out, transform: "scale(1.15)", transformOrigin: "0 0" }}>
      {children}
    </div>
  );
}

/* ---------- Accroche ---------- */
function Hook({ f }: { f: number }) {
  const swap = EV.hook.swap;
  const a = interpolate(f, [swap - 6, swap], [1, 0], clamp);
  const b = enter(f, swap + 2);
  const mark = ramp(f, swap + 12, swap + 30);
  const badge = enter(f, 10, 30, 11);
  return (
    <AbsoluteFill style={{ background: C.night, fontFamily: FONT }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 66%, rgba(31,79,216,.4), transparent 70%)" }} />
      <div style={{ position: "absolute", left: 160, top: 900 - f * 0.5, width: 700, padding: "40px 44px", borderRadius: 18, background: "#FBFBF9", transform: `rotate(${-3 + Math.sin(f / 30) * 0.8}deg)`, boxShadow: "0 40px 90px rgba(0,0,0,.55)" }}>
        <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: "#6B7280" }}>CAISSE-MALADIE EXEMPLE SA</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: C.ink, marginTop: 20 }}>Votre prime 2027</div>
        <div style={{ fontFamily: MONO, fontSize: 26, color: "#374151", marginTop: 8 }}>Assurance de base LAMal · franchise CHF 300</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 26 }}>
          <span style={{ fontSize: 64, fontWeight: 800, color: C.ink, letterSpacing: -1 }}>CHF 438.20</span>
          <span style={{ fontSize: 28, color: "#6B7280" }}>/ mois</span>
        </div>
        <div style={{ marginTop: 16, display: "inline-block", padding: "8px 18px", borderRadius: 30, background: C.dangerSoft, color: C.danger, fontSize: 30, fontWeight: 800, transform: `scale(${badge})` }}>+ CHF 24.10 par mois</div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 100, top: 250 }}>
        <div style={{ opacity: a, position: "absolute", left: 0, right: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: C.mark }}>Caisse-maladie</div>
          <div style={{ fontSize: 100, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1.02, marginTop: 18 }}>{nb("Votre prime augmente en 2027 ?")}</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, ...rise(b, 30) }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: C.mark }}>Bonne nouvelle</div>
          <div style={{ fontSize: 92, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1.04, marginTop: 18 }}>
            Vous pouvez changer de caisse.
            <br />
            <span style={{ position: "relative", display: "inline-block" }}>
              <span>{nb("Jusqu’au 30 novembre.")}</span>
              <span style={{ position: "absolute", inset: "0 -10px", padding: "0 10px", background: C.mark, color: C.ink, clipPath: `inset(0 ${(1 - mark) * 100}% 0 0)` }}>{nb("Jusqu’au 30 novembre.")}</span>
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- La règle ---------- */
function Rule({ f }: { f: number }) {
  const e = EV.regle;
  const tile = enter(f, e.date, 30, 14);
  const mark = ramp(f, e.mark, e.mark + 16);
  return (
    <>
      <div style={{ display: "flex", gap: 44, alignItems: "center", marginTop: 40 }}>
        <div style={{ width: 340, borderRadius: 40, overflow: "hidden", background: C.surface, boxShadow: "0 40px 80px -20px rgba(17,24,39,.3)", transform: `scale(${0.7 + tile * 0.3}) rotate(${(1 - tile) * -8}deg)`, opacity: tile }}>
          <div style={{ background: C.primary, color: "#fff", textAlign: "center", padding: "22px 0", fontSize: 40, fontWeight: 800, letterSpacing: 6 }}>NOVEMBRE</div>
          <div style={{ textAlign: "center", fontSize: 230, fontWeight: 800, letterSpacing: -10, color: C.ink, lineHeight: 1.1, padding: "10px 0 24px" }}>30</div>
        </div>
        <div style={{ flex: 1, fontSize: 46, fontWeight: 800, lineHeight: 1.25, color: C.ink, ...rise(enter(f, e.date + 12)) }}>
          Date de{" "}
          <Mark p={mark}>réception</Mark>
          <br />
          par la caisse
          <div style={{ fontSize: 32, fontWeight: 600, color: C.ink2, marginTop: 18, lineHeight: 1.35 }}>Un jour de retard, et le changement ne vaut plus pour le 1er janvier.</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, fontSize: 22, color: C.ink3, opacity: enter(f, e.sub) }}>Source : ch.ch, LAMal art. 7 · information générale, pas un conseil juridique</div>
    </>
  );
}

/* ---------- 01 Comparer ---------- */
function Compare({ f }: { f: number }) {
  const e = EV.comparer;
  const rows = [
    { n: "Caisse A · la vôtre", v: 438.2 },
    { n: "Caisse B", v: 412.6 },
    { n: "Caisse C", v: 397.9 },
    { n: "Caisse D", v: 451.3 },
  ];
  const max = 460;
  const best = enter(f, e.best, 30, 13);
  return (
    <>
      <Label>
        <span style={{ fontSize: 24 }}>Exemple fictif · prime mensuelle, même franchise</span>
      </Label>
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 26 }}>
        {rows.map((r, i) => {
          const p = ramp(f, e.bars + i * 5, e.bars + i * 5 + 24);
          const isBest = r.n === "Caisse C";
          return (
            <div key={r.n}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 700, color: C.ink2, marginBottom: 10 }}>
                <span>{r.n}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", color: isBest && best > 0.5 ? C.success : C.ink, fontWeight: 800 }}>CHF {r.v.toFixed(2)}</span>
              </div>
              <div style={{ height: 34, borderRadius: 17, background: "rgba(17,24,39,.07)", overflow: "hidden" }}>
                <div style={{ width: `${(r.v / max) * 100 * p}%`, height: "100%", borderRadius: 17, background: isBest && best > 0.5 ? C.success : i === 0 ? C.primary : "#9AA3B2" }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 14, padding: "18px 28px", borderRadius: 22, background: C.successSoft, color: C.success, fontSize: 38, fontWeight: 800, transform: `scale(${best})`, transformOrigin: "left center" }}>
        <Icon name="check" size={34} stroke={3} /> CHF 483.60 d’économie par an
      </div>
    </>
  );
}

/* ---------- 02 S'inscrire ailleurs ---------- */
function Insure({ f }: { f: number }) {
  const e = EV.assurer;
  const arrow = ramp(f, e.arrow, e.arrow + 18);
  const ok = enter(f, e.confirm, 30, 12);
  const box = (title: string, sub: string, highlight: boolean, p: number) => (
    <div style={{ width: 300, padding: "30px 26px", borderRadius: 30, background: C.surface, border: `3px solid ${highlight ? C.success : C.line}`, boxShadow: "0 30px 60px -20px rgba(17,24,39,.25)", ...rise(p) }}>
      <div style={{ width: 70, height: 70, borderRadius: 20, background: highlight ? C.successSoft : C.surface2, display: "grid", placeItems: "center", color: highlight ? C.success : C.ink2 }}>
        <Icon name="shield" size={38} />
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, marginTop: 18 }}>{title}</div>
      <div style={{ fontSize: 28, color: C.ink2, marginTop: 6 }}>{sub}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 60 }}>
      {box("Ancienne caisse", "Vous libère ensuite", false, enter(f, 4))}
      <svg width="90" height="60" viewBox="0 0 100 60" style={{ flexShrink: 0 }}>
        <path d="M5 30 H85 M65 12 L88 30 L65 48" fill="none" stroke={C.primary} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="140" strokeDashoffset={140 * (1 - arrow)} />
      </svg>
      <div style={{ position: "relative" }}>
        {box("Nouvelle caisse", "Demandez l’affiliation", ok > 0.5, enter(f, 10))}
        <div style={{ position: "absolute", left: 30, right: 30, bottom: -36, padding: "12px 0", borderRadius: 18, background: C.success, color: "#fff", fontSize: 28, fontWeight: 800, textAlign: "center", transform: `scale(${ok})` }}>✓ Affiliation confirmée</div>
      </div>
    </div>
  );
}

/* ---------- 03 Résilier ---------- */
function Cancel({ f }: { f: number }) {
  const e = EV.resilier;
  const marks = [e.f0, e.f1, e.f2, e.f3].map((t) => ramp(f, t, t + 12));
  const warn = enter(f, e.warn, 30, 14);
  const sheet = enter(f, 2, 30, 18);
  return (
    <>
      <div style={{ width: 660, padding: "40px 44px", background: "#fff", borderRadius: 10, boxShadow: "0 40px 80px -20px rgba(17,24,39,.35)", fontSize: 25, lineHeight: 1.55, color: "#14181F", fontFamily: "Helvetica, Arial, sans-serif", transform: `rotate(-1.5deg) translateY(${(1 - sheet) * 60}px)`, opacity: sheet }}>
        <div>
          <Mark p={marks[0]!}>Sophie Martin, Rue du Lac 12, 1003 Lausanne</Mark>
        </div>
        <div style={{ marginTop: 22, fontWeight: 700 }}>
          Résiliation de mon <Mark p={marks[2]!}>assurance obligatoire des soins (LAMal)</Mark>
        </div>
        <div style={{ marginTop: 6 }}>
          <Mark p={marks[1]!}>N° d’assuré 756.1234.5678.97</Mark>
        </div>
        <div style={{ marginTop: 18 }}>Madame, Monsieur,</div>
        <div style={{ marginTop: 8 }}>
          Je résilie mon assurance de base <Mark p={marks[3]!}>pour le 31 décembre 2026</Mark>.
        </div>
        <div style={{ height: 10, width: "88%", background: "#E5E7EB", borderRadius: 5, marginTop: 18 }} />
        <div style={{ height: 10, width: "62%", background: "#E5E7EB", borderRadius: 5, marginTop: 14 }} />
        <div style={{ marginTop: 26, fontFamily: '"Brush Script MT", cursive', fontSize: 44, color: C.primaryDeep, opacity: marks[3] }}>S. Martin</div>
      </div>
      <div style={{ marginTop: 34, display: "flex", gap: 14, alignItems: "center", padding: "18px 24px", borderRadius: 20, background: C.warningSoft, color: C.warning, fontSize: 30, fontWeight: 700, lineHeight: 1.3, ...rise(warn, 20) }}>
        <Icon name="alert" size={34} /> Complémentaires (LCA) : ne les résiliez qu’une fois accepté ailleurs.
      </div>
    </>
  );
}

/* ---------- 04 Envoyer ---------- */
function Send({ f }: { f: number }) {
  const e = EV.envoyer;
  const env = enter(f, 2, 30, 16);
  const stamp = enter(f, e.stamp, 30, 9);
  const receipt = enter(f, e.receipt, 30, 14);
  return (
    <div style={{ position: "relative", height: 720 }}>
      <div style={{ position: "absolute", left: 10, top: 30, width: 620, height: 380, borderRadius: 18, background: "#FBFBF9", boxShadow: "0 40px 80px -20px rgba(17,24,39,.35)", transform: `rotate(-3deg) translateX(${(1 - env) * -200}px)`, opacity: env, overflow: "hidden" }}>
        <svg width="620" height="380" viewBox="0 0 620 380" style={{ position: "absolute", inset: 0 }}>
          <path d="M0 0 L310 210 L620 0" fill="none" stroke="#D1D5DB" strokeWidth="4" />
        </svg>
        <div style={{ position: "absolute", left: 300, top: 230, fontSize: 26, lineHeight: 1.4, color: "#374151" }}>
          Caisse-maladie Exemple SA
          <br />
          Case postale
          <br />
          1000 Lausanne
        </div>
        <div style={{ position: "absolute", left: 40, top: 54, padding: "10px 18px", borderRadius: 10, border: `6px solid ${C.danger}`, color: C.danger, display: "flex", alignItems: "center", gap: 12, fontWeight: 800, transform: `scale(${2 - stamp}) rotate(-10deg)`, opacity: stamp }}>
          <span style={{ fontSize: 58, lineHeight: 1 }}>R</span>
          <span style={{ fontSize: 26, letterSpacing: 2 }}>RECOMMANDÉ</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 370, top: 340, width: 380, padding: "26px 30px", borderRadius: 16, background: C.surface, border: `2px dashed ${C.line}`, boxShadow: "0 30px 60px -20px rgba(17,24,39,.3)", transform: `rotate(4deg) translateY(${(1 - receipt) * 80}px)`, opacity: receipt }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, color: C.ink3 }}>RÉCÉPISSÉ</div>
        <div style={{ fontFamily: MONO, fontSize: 26, marginTop: 8 }}>98.00.123456.78901234</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.success, marginTop: 12 }}>✓ Votre preuve d’envoi</div>
      </div>
    </div>
  );
}

/* ---------- Avec Clair : le téléphone ---------- */
const SUMMARY_A = "Votre prime passe à CHF 438.20 par mois, soit ";
const SUMMARY_B = "CHF 289.20 de plus par an";
const SUMMARY_C = ". Pour changer de caisse, votre résiliation doit arriver avant le 30 novembre.";

function ClairScreen({ f }: { f: number }) {
  const e = EV.clair;
  const full = SUMMARY_A + SUMMARY_B + SUMMARY_C;
  const n = typed(full, f, e.typeStart, e.typeEnd).length;
  const mark = ramp(f, e.mark, e.mark + 16);
  const card = enter(f, e.card);
  const press = interpolate(f, [e.tap - 3, e.tap, e.tap + 5], [1, 0.93, 1], clamp);
  const letter = ramp(f, e.letter, e.letter + 16);
  const pdf = enter(f, e.pdf, 30, 12);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg }}>
      <StatusBar />
      <TopBar back="Courriers" title="Nouvelle prime d’assurance-maladie 2027" />
      <div style={{ display: "flex", gap: 6, padding: "0 20px", marginTop: -4 }}>
        <Badge>Prime d’assurance</Badge>
        <Badge tone="primary">Original en allemand</Badge>
      </div>
      <Card style={{ margin: "14px 18px", padding: "16px 18px" }}>
        <Label>En bref</Label>
        <div style={{ fontSize: 17, lineHeight: 1.5, marginTop: 8, minHeight: 104 }}>
          {SUMMARY_A.slice(0, n)}
          {n > SUMMARY_A.length ? <Mark p={mark}>{SUMMARY_B.slice(0, n - SUMMARY_A.length)}</Mark> : null}
          {SUMMARY_C.slice(0, Math.max(0, n - SUMMARY_A.length - SUMMARY_B.length))}
        </div>
      </Card>
      <Card style={{ margin: "0 18px", overflow: "hidden", border: "2px solid rgba(31,79,216,.4)", ...rise(card, 40) }}>
        <div style={{ background: C.primarySoft, color: C.primary, fontSize: 11, fontWeight: 800, letterSpacing: 1.2, padding: "9px 16px" }}>PROCHAINE ÉTAPE</div>
        <div style={{ padding: "14px 16px 18px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.25 }}>Envoyer la résiliation si vous changez de caisse</div>
          <div style={{ marginTop: 8 }}>
            <Badge tone="warning">Avant le 30 novembre</Badge>
          </div>
          <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 16px", borderRadius: 13, background: C.primary, color: "#fff", fontSize: 14.5, fontWeight: 800, transform: `scale(${press})` }}>
            <Icon name="pen" size={15} color="#fff" /> Préparer la lettre
          </div>
        </div>
      </Card>
      <Tap x={95} y={398} frame={f} at={e.tap} />
      {letter > 0 ? (
        <div style={{ position: "absolute", left: 20, right: 20, top: 66, transform: `translateY(${(1 - letter) * 700}px)`, background: "#fff", borderRadius: 6, boxShadow: "0 30px 60px rgba(17,24,39,.35)", padding: "22px 22px 30px", fontSize: 9.5, lineHeight: 1.5, color: "#14181F", fontFamily: "Helvetica, Arial, sans-serif" }}>
          <div style={{ fontSize: 8.5 }}>Sophie Martin · Rue du Lac 12 · 1003 Lausanne</div>
          <div style={{ marginLeft: "52%", marginTop: 14 }}>
            Krankenkasse Beispiel AG
            <br />
            Postfach
            <br />
            8000 Zürich
          </div>
          <div style={{ marginTop: 14 }}>Lausanne, le 29 octobre 2026</div>
          <div style={{ marginTop: 10, fontWeight: 700, fontSize: 10.5 }}>
            <Mark p={ramp(f, e.letter + 14, e.letter + 28)}>Résiliation de mon assurance obligatoire des soins (LAMal) – n° 756.1234.5678.97</Mark>
          </div>
          <div style={{ marginTop: 10 }}>Madame, Monsieur,</div>
          <div style={{ marginTop: 8 }}>
            Par la présente, je résilie mon assurance obligatoire des soins pour le 31 décembre 2026. La résiliation prendra effet dès que mon nouvel assureur vous aura confirmé mon affiliation.
          </div>
          {[90, 70].map((w, i) => (
            <div key={i} style={{ height: 4, width: `${w}%`, background: "#E5E7EB", borderRadius: 2, marginTop: 9 }} />
          ))}
          <div style={{ marginTop: 14 }}>Sophie Martin</div>
          <div style={{ position: "absolute", right: 14, bottom: -20, transform: `scale(${pdf})`, display: "flex", gap: 6, alignItems: "center", padding: "9px 14px", borderRadius: 14, background: C.ink, color: "#fff", fontSize: 13.5, fontWeight: 800, fontFamily: FONT, boxShadow: "0 10px 24px rgba(0,0,0,.3)" }}>
            <Icon name="download" size={16} color="#fff" stroke={2.5} /> PDF prêt à signer
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClairStage({ f, len }: { f: number; len: number }) {
  const W = SCREEN_W * SCREEN_SCALE + 32;
  const inP = enter(f, 4, 30, 20);
  const out = interpolate(f, [len - 10, len], [1, 0], clamp);
  const scale = 1.36;
  const focus = interpolate(f, [EV.clair.letter - 6, EV.clair.letter + 10], [44, 60], clamp);
  const ty = 56 - (16 + focus * SCREEN_SCALE) * scale;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 600, bottom: 0, overflow: "hidden", opacity: out, maskImage: "linear-gradient(to bottom, transparent 0, #000 46px)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 46px)" }}>
      <Phone style={{ left: (1080 - W) / 2, top: 0, transformOrigin: "50% 0", transform: `translateY(${ty + (1 - inP) * 1100 + Math.sin(f / 40) * 5}px) scale(${scale})` }}>
        <ClairScreen f={f} />
      </Phone>
    </div>
  );
}

/* ---------- Fin ---------- */
function End({ f }: { f: number }) {
  const e = EV.fin;
  const top = enter(f, 0);
  const logo = enter(f, e.logo, 30, 13);
  const soon = enter(f, e.soon);
  const pills = [enter(f, e.platforms, 30, 14), enter(f, e.platforms + 6, 30, 14)];
  const follow = enter(f, e.follow);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center" }}>
      <div style={{ position: "absolute", top: 250, left: 80, right: 80, textAlign: "center", ...rise(top) }}>
        <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: -2, color: C.ink, lineHeight: 1.1 }}>
          Un courrier expliqué
          <br />
          <Mark p={ramp(f, 10, 30)}>chaque semaine.</Mark>
        </div>
      </div>
      <div style={{ position: "absolute", top: 580, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${0.5 + logo * 0.5}) rotate(${(1 - logo) * -14}deg)`, opacity: logo }}>
          <LogoMark size={190} />
        </div>
        <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: -6, color: C.ink, opacity: logo }}>clair</div>
        <div style={{ fontSize: 42, fontWeight: 600, color: C.ink2, opacity: enter(f, e.logo + 12) }}>Votre courrier administratif, enfin clair.</div>
      </div>
      <div style={{ position: "absolute", top: 1130, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: C.ink, ...rise(soon, 20) }}>Bientôt disponible sur</div>
        <div style={{ display: "flex", gap: 26 }}>
          {["iOS", "Android"].map((p, i) => (
            <div key={p} style={{ padding: "22px 58px", borderRadius: 28, background: C.ink, color: "#fff", fontSize: 60, fontWeight: 800, opacity: pills[i], transform: `translateY(${(1 - pills[i]!) * 40}px)`, boxShadow: "0 20px 40px -10px rgba(17,24,39,.45)" }}>
              {p}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.primary, opacity: follow, marginTop: 10 }}>Abonnez-vous pour ne rien rater</div>
      </div>
    </AbsoluteFill>
  );
}

function Scene({ id, children }: { id: string; children: (f: number, len: number) => ReactNode }) {
  const c = ch(id);
  const frame = useCurrentFrame();
  return (
    <Sequence from={c.start} durationInFrames={c.len}>
      {children(frame - c.start, c.len)}
    </Sequence>
  );
}

export function ClairLamal() {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("Police Manrope"));
  useEffect(() => {
    Promise.all([document.fonts.load(`800 100px "Manrope Variable"`), document.fonts.load(`600 40px "Manrope Variable"`)]).finally(() => continueRender(handle));
  }, [handle]);
  const visuals: Record<Exclude<StepId, "clair">, (f: number) => ReactNode> = {
    regle: (f) => <Rule f={f} />,
    comparer: (f) => <Compare f={f} />,
    assurer: (f) => <Insure f={f} />,
    resilier: (f) => <Cancel f={f} />,
    envoyer: (f) => <Send f={f} />,
  };
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Background />
      {STEPS.map((id) => (
        <Scene key={id} id={id}>
          {(f, len) => (
            <>
              <Caption id={id} f={f} len={len} />
              {id === "clair" ? (
                <ClairStage f={f} len={len} />
              ) : (
                <Stage f={f} len={len}>
                  {visuals[id](f)}
                </Stage>
              )}
            </>
          )}
        </Scene>
      ))}
      <Scene id="hook">{(f) => <Hook f={f} />}</Scene>
      <Scene id="fin">{(f) => <End f={f} />}</Scene>
      <Progress frame={frame} />
      <Wipe frame={frame} at={ch("regle").start} />
      <Wipe frame={frame} at={ch("fin").start} />
    </AbsoluteFill>
  );
}
