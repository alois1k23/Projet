import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { C, EV, MONO, clamp, enter, ramp, typed } from "./theme";
import { Badge, BottomNav, Card, Icon, Label, LogoMark, Mark, StatusBar, Tap, TopBar } from "./ui";

/* Données fictives de la démonstration (aucune personne ni entreprise réelle). */
const BILL = {
  title: "Facture d’électricité juillet – septembre",
  sender: "Elektrizitätswerk Beispiel AG",
  amount: "CHF 186.45",
  iban: "CH44 3199 9123 0008 8901 2",
  reference: "21 00000 00003 13947 14300 09017",
  invoice: "2026-118 204",
};

const rise = (p: number, dist = 24) => ({ opacity: p, transform: `translateY(${(1 - p) * dist}px)` });

/** Contenu glissant entre deux sous-écrans d'un même chapitre. */
function Slide({ p, children, from = "right" }: { p: number; children: ReactNode; from?: "right" | "bottom" }) {
  const t = from === "right" ? `translateX(${(1 - p) * 60}px)` : `translateY(${(1 - p) * 120}px)`;
  return <div style={{ position: "absolute", inset: 0, opacity: p, transform: t }}>{children}</div>;
}

/* ---------- 01 Photographier ---------- */

function Paper({ page }: { page: 1 | 2 }) {
  const line = (w: number, mt = 9) => <div style={{ height: 5, width: `${w}%`, background: "#E5E7EB", borderRadius: 3, marginTop: mt }} />;
  return (
    <div style={{ width: 270, height: 380, background: "#FBFBF9", borderRadius: 4, padding: "26px 24px", fontFamily: MONO, color: "#374151", boxShadow: "0 20px 50px rgba(0,0,0,.45)" }}>
      {page === 1 ? (
        <>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2 }}>ELEKTRIZITÄTSWERK BEISPIEL AG</div>
          {line(55, 6)}
          <div style={{ marginTop: 26, fontSize: 12, fontWeight: 700 }}>Rechnung Nr. {BILL.invoice}</div>
          <div style={{ fontSize: 9.5, marginTop: 6 }}>Stromverbrauch Juli – September</div>
          {line(90, 16)}
          {line(84)}
          {line(70)}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 9 }}>Total</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>CHF 186.45</div>
              <div style={{ fontSize: 9, marginTop: 4 }}>Zahlbar bis 09.11.</div>
            </div>
            <QrCode />
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 700 }}>Detailübersicht</div>
          {line(60, 6)}
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <div style={{ height: 5, width: `${40 + ((i * 17) % 30)}%`, background: "#E5E7EB", borderRadius: 3 }} />
              <div style={{ height: 5, width: "18%", background: "#E5E7EB", borderRadius: 3 }} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function QrCode() {
  // Motif déterministe évoquant le code QR suisse (croix au centre), purement décoratif.
  const cells = Array.from({ length: 121 }, (_, i) => ((i * 37 + (i % 7) * 11) % 5 < 2 ? 1 : 0));
  return (
    <svg width="64" height="64" viewBox="0 0 11 11" style={{ display: "block" }}>
      {cells.map((v, i) => (v ? <rect key={i} x={i % 11} y={Math.floor(i / 11)} width="1" height="1" fill="#111827" /> : null))}
      {[
        [0, 0],
        [8, 0],
        [0, 8],
      ].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y} width="3" height="3" fill="#111827" />
          <rect x={x! + 0.6} y={y! + 0.6} width="1.8" height="1.8" fill="#fff" />
          <rect x={x! + 1} y={y! + 1} width="1" height="1" fill="#111827" />
        </g>
      ))}
      <rect x="4.2" y="4.2" width="2.6" height="2.6" fill="#fff" />
      <rect x="4.5" y="4.5" width="2" height="2" fill="#111827" />
      <rect x="5.3" y="4.8" width="0.4" height="1.4" fill="#fff" />
      <rect x="4.8" y="5.3" width="1.4" height="0.4" fill="#fff" />
    </svg>
  );
}

export function PhotoScreen({ f }: { f: number }) {
  const e = EV.photo;
  const flash = Math.max(interpolate(f, [e.shutter1, e.shutter1 + 2, e.shutter1 + 10], [0, 1, 0], clamp), interpolate(f, [e.shutter2, e.shutter2 + 2, e.shutter2 + 10], [0, 1, 0], clamp));
  const page2 = ramp(f, e.addPage + 4, e.addPage + 16);
  const thumb1 = enter(f, e.page1);
  const thumb2 = enter(f, e.page2);
  const analyse = enter(f, 126);
  const press = (at: number) => interpolate(f, [at - 3, at, at + 5], [1, 0.92, 1], clamp);
  const corner = (s: object) => <div style={{ position: "absolute", width: 34, height: 34, borderColor: "#fff", borderStyle: "solid", borderWidth: 0, ...s }} />;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000" }}>
      <StatusBar dark />
      <div style={{ position: "absolute", left: 0, right: 0, top: 50, height: 560, background: "radial-gradient(circle at 50% 40%, #3B3F47, #15171B)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 60, top: 70, transform: `rotate(-2deg) translateX(${-page2 * 360}px)`, opacity: 1 - page2 }}>
          <Paper page={1} />
        </div>
        <div style={{ position: "absolute", left: 60, top: 70, transform: `rotate(1.5deg) translateX(${(1 - page2) * 360}px)`, opacity: page2 }}>
          <Paper page={2} />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 46, bottom: 70 }}>
          {corner({ left: 0, top: 0, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 10 })}
          {corner({ right: 0, top: 0, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: 10 })}
          {corner({ left: 0, bottom: 0, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 10 })}
          {corner({ right: 0, bottom: 0, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: 10 })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 700, opacity: 0.85 }}>
          {f < e.page1 ? "Page 1 · posez la lettre à plat" : f < e.page2 ? "Page 2" : "2 pages prêtes"}
        </div>
      </div>
      {/* Commandes */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px" }}>
        <div style={{ position: "relative", width: 70, height: 70 }}>
          {[thumb1, thumb2].map((t, i) =>
            t > 0.01 ? (
              <div key={i} style={{ position: "absolute", left: i * 12, top: -i * 6, width: 48, height: 64, background: "#FBFBF9", borderRadius: 6, border: "2px solid #fff", transform: `scale(${t}) rotate(${i ? 6 : -4}deg)`, boxShadow: "0 4px 10px rgba(0,0,0,.4)" }} />
            ) : null,
          )}
          {thumb1 > 0.5 ? (
            <div style={{ position: "absolute", right: -8, top: -14, minWidth: 24, height: 24, borderRadius: 12, background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, display: "grid", placeItems: "center" }}>{f >= e.page2 ? 2 : 1}</div>
          ) : null}
        </div>
        <div style={{ width: 78, height: 78, borderRadius: 40, border: "5px solid #fff", display: "grid", placeItems: "center", transform: `scale(${Math.min(press(e.shutter1), press(e.shutter2))})` }}>
          <div style={{ width: 62, height: 62, borderRadius: 32, background: "#fff" }} />
        </div>
        <div style={{ width: 70, color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center", opacity: f > e.page1 + 6 && f < e.page2 ? 1 : 0.35 }}>
          <div style={{ width: 38, height: 38, margin: "0 auto 4px", borderRadius: 12, background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center", transform: `scale(${press(e.addPage)})` }}>
            <Icon name="plus" size={20} color="#fff" />
          </div>
          Page
        </div>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 560, ...rise(analyse, 40) }}>
        <div style={{ height: 54, borderRadius: 16, background: C.primary, color: "#fff", fontSize: 17, fontWeight: 800, display: "grid", placeItems: "center", transform: `scale(${press(e.analyse)})`, boxShadow: "0 10px 24px rgba(31,79,216,.45)" }}>Analyser les 2 pages</div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash }} />
      <Tap x={195} y={679} frame={f} at={e.shutter1} />
      <Tap x={321} y={660} frame={f} at={e.addPage} />
      <Tap x={195} y={679} frame={f} at={e.shutter2} />
      <Tap x={195} y={587} frame={f} at={e.analyse} />
    </div>
  );
}

/* ---------- 02 Comprendre ---------- */

const STEPS = ["Envoi sécurisé du document", "Lecture du courrier", "Recherche des montants et des échéances", "Rédaction de l’explication"];
const SUMMARY_A = "Votre fournisseur vous facture CHF 186.45 d’électricité pour juillet à septembre. C’est une facture ordinaire : payez-la ";
const SUMMARY_B = "avant le 9 novembre";
const SUMMARY_C = " pour éviter des frais de rappel.";

function Spinner({ f }: { f: number }) {
  return <div style={{ width: 20, height: 20, borderRadius: 10, border: `3px solid ${C.primarySoft}`, borderTopColor: C.primary, transform: `rotate(${f * 18}deg)` }} />;
}

export function UnderstandScreen({ f }: { f: number }) {
  const e = EV.comprendre;
  const starts = [0, e.step1, e.step2, e.step3, e.result - 6];
  const result = ramp(f, e.result, e.result + 14);
  const badge = enter(f, e.badge);
  const full = SUMMARY_A + SUMMARY_B + SUMMARY_C;
  const shown = typed(full, f, e.typeStart, e.typeEnd).length;
  const a = SUMMARY_A.slice(0, shown);
  const b = SUMMARY_B.slice(0, Math.max(0, shown - SUMMARY_A.length));
  const c = SUMMARY_C.slice(0, Math.max(0, shown - SUMMARY_A.length - SUMMARY_B.length));
  const mark = ramp(f, e.typeEnd + 4, e.typeEnd + 22);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - result }}>
        <StatusBar />
        <TopBar title="Ajouter un courrier" />
        <Card style={{ margin: "8px 18px", padding: 18 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
            <div style={{ position: "relative", width: 44, height: 56 }}>
              <div style={{ position: "absolute", left: 6, top: -4, width: 38, height: 50, background: "#F3F4F6", border: `1px solid ${C.line}`, borderRadius: 5, transform: "rotate(6deg)" }} />
              <div style={{ position: "absolute", inset: 0, background: "#FBFBF9", border: `1px solid ${C.line}`, borderRadius: 5 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>2 pages</div>
              <div style={{ fontSize: 12, color: C.ink3 }}>Cela prend en général de 10 à 30 secondes.</div>
            </div>
          </div>
          {STEPS.map((s, i) => {
            const active = f >= starts[i]! && f < starts[i + 1]!;
            const done = f >= starts[i + 1]!;
            const shownStep = ramp(f, starts[i]! - 4, starts[i]! + 6);
            return (
              <div key={s} style={{ display: "flex", gap: 12, alignItems: "center", padding: "9px 0", opacity: 0.25 + 0.75 * shownStep }}>
                <div style={{ width: 22, display: "grid", placeItems: "center" }}>
                  {done ? (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: C.success, display: "grid", placeItems: "center" }}>
                      <Icon name="check" size={14} color="#fff" stroke={3} />
                    </div>
                  ) : active ? (
                    <Spinner f={f} />
                  ) : (
                    <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${C.line}` }} />
                  )}
                </div>
                <span style={{ fontSize: 14.5, fontWeight: active ? 800 : 600, color: done ? C.ink2 : C.ink }}>{s}</span>
              </div>
            );
          })}
        </Card>
      </div>
      {result > 0 ? (
        <Slide p={result} from="bottom">
          <div style={{ position: "absolute", inset: 0, background: C.bg }}>
            <StatusBar />
            <TopBar back="Courriers" title={BILL.title} />
            <div style={{ display: "flex", gap: 6, padding: "0 20px", marginTop: -4 }}>
              <Badge>Facture</Badge>
              <span style={{ transform: `scale(${0.6 + badge * 0.4})`, opacity: badge, display: "inline-block" }}>
                <Badge tone="primary">Original en allemand</Badge>
              </span>
            </div>
            <div style={{ padding: "6px 20px 0", fontSize: 13.5, color: C.ink2 }}>{BILL.sender}</div>
            <Card style={{ margin: "14px 18px", padding: "16px 18px" }}>
              <Label>En bref</Label>
              <div style={{ fontSize: 17.5, lineHeight: 1.5, marginTop: 8, minHeight: 130 }}>
                {a}
                {b ? <Mark p={mark}>{b}</Mark> : null}
                {c}
                {shown < full.length && f >= e.typeStart ? <span style={{ color: C.primary, fontWeight: 300 }}>|</span> : null}
              </div>
            </Card>
          </div>
        </Slide>
      ) : null}
    </div>
  );
}

/* ---------- 03 L'essentiel ---------- */

function Fact({ label, children, p, warn = 0, right }: { label: string; children: ReactNode; p: number; warn?: number; right?: ReactNode }) {
  return (
    <div
      style={{
        margin: "0 18px 10px",
        padding: "12px 16px",
        borderRadius: 16,
        background: C.surface,
        border: `${1 + warn}px solid ${warn > 0.1 ? "#E9B949" : C.line}`,
        boxShadow: warn > 0.1 ? `0 0 0 ${warn * 4}px rgba(255,216,77,.35)` : "none",
        ...rise(p),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: C.ink3 }}>
        {label}
        {warn > 0.05 ? (
          <span style={{ transform: `scale(${warn})`, display: "inline-block" }}>
            <Badge tone="warning">
              <Icon name="alert" size={12} /> À vérifier
            </Badge>
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
        <div style={{ minWidth: 0 }}>{children}</div>
        {right}
      </div>
    </div>
  );
}

function CopyBtn({ copied }: { copied: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 11, border: `1px solid ${copied ? C.success : C.line}`, background: copied ? C.successSoft : C.surface, color: copied ? C.success : C.ink2, fontSize: 12.5, fontWeight: 800 }}>
      <Icon name={copied ? "check" : "copy"} size={14} stroke={2.4} /> {copied ? "Copié" : "Copier"}
    </div>
  );
}

export function EssentialScreen({ f }: { f: number }) {
  const e = EV.essentiel;
  const cards = [e.card0, e.card1, e.card2, e.card3].map((d) => enter(f, d));
  const copied = f >= e.copyTap + 2;
  const toast = interpolate(f, [e.copyTap + 2, e.copyTap + 8, e.copyTap + 40, e.copyTap + 48], [0, 1, 1, 0], clamp);
  const warn = enter(f, e.review, 30, 12);
  const hint = enter(f, e.review + 10);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg }}>
      <StatusBar />
      <div style={{ padding: "6px 20px 10px", display: "flex", alignItems: "center", gap: 4, color: C.ink2, fontSize: 14, fontWeight: 700 }}>
        <Icon name="back" size={16} /> Courriers
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 18, fontWeight: 800 }}>{BILL.title}</div>
      <div style={{ padding: "0 20px 8px" }}>
        <Label>Détails</Label>
      </div>
      <Fact label="Montant" p={cards[0]!} warn={warn}>
        <span style={{ fontSize: 24, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{BILL.amount}</span>
      </Fact>
      <div style={{ margin: "-4px 22px 10px", fontSize: 12.5, color: C.warning, fontWeight: 700, height: hint > 0.01 ? 18 : 0, opacity: hint, overflow: "hidden" }}>Photo peu nette : comparez avec l’original.</div>
      <Fact label="Échéance" p={cards[1]!}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>9 novembre</span>
          <Badge tone="warning">Dans 12 jours</Badge>
        </span>
      </Fact>
      <Fact label="IBAN · contrôle réussi" p={cards[2]!} right={<CopyBtn copied={copied} />}>
        <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700 }}>{BILL.iban}</span>
      </Fact>
      <Fact label="Référence de paiement" p={cards[3]!} right={<CopyBtn copied={false} />}>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, wordBreak: "break-all" }}>{BILL.reference}</span>
      </Fact>
      <div style={{ position: "absolute", left: "50%", top: 520, transform: `translate(-50%, ${(1 - toast) * 12}px)`, opacity: toast, padding: "10px 16px", borderRadius: 14, background: C.ink, color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" }}>
        <Icon name="check" size={16} color="#7EE2A8" stroke={3} /> IBAN copié : collez-le dans votre e-banking
      </div>
      <Tap x={326} y={345} frame={f} at={e.copyTap} />
      <BottomNav active={1} />
    </div>
  );
}

/* ---------- 04 Agir ---------- */

type Row = { title: string; sub: string; badge: string; tone: "danger" | "warning" | "neutral"; amount?: string };
const GROUPS: { label: string; rows: Row[] }[] = [
  { label: "En retard", rows: [{ title: "Renvoyer le formulaire de la commune", sub: "Commune de Lausanne (exemple)", badge: "En retard de 2 jours", tone: "danger" }] },
  {
    label: "Cette semaine",
    rows: [
      { title: "Former opposition si vous contestez la dette", sub: "Office des poursuites (exemple)", badge: "Dans 4 jours", tone: "warning" },
      { title: "Payer la prime de novembre", sub: "Caisse-maladie Exemple SA", badge: "Dans 6 jours", tone: "warning", amount: "CHF 438.20" },
    ],
  },
  {
    label: "Plus tard",
    rows: [
      { title: "Vérifier le relevé du compteur", sub: BILL.sender, badge: "Dans 12 jours", tone: "neutral" },
      { title: "Envoyer la résiliation si vous changez de caisse", sub: "Caisse-maladie Exemple SA", badge: "Dans 4 semaines", tone: "neutral" },
    ],
  },
];

function TaskRow({ r, p }: { r: Row; p: number }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "11px 14px", borderTop: `1px solid ${C.line}`, ...rise(p, 14) }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid #C9CED6`, marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.25 }}>{r.title}</div>
        <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{r.sub}</div>
        <div style={{ marginTop: 6 }}>
          <Badge tone={r.tone}>{r.badge}</Badge>
        </div>
      </div>
      {r.amount ? <div style={{ fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>{r.amount}</div> : null}
    </div>
  );
}

export function TodoList({ f, groupsAt }: { f: number; groupsAt: number[] }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg }}>
      <StatusBar />
      <div style={{ padding: "6px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6 }}>À faire</div>
          <div style={{ fontSize: 13, color: C.ink2, marginTop: 2 }}>Du plus urgent au plus lointain.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 11px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.surface, fontSize: 12.5, fontWeight: 800, color: C.ink2 }}>
          <Icon name="calendar" size={15} /> Agenda
        </div>
      </div>
      {GROUPS.map((g, gi) => {
        const p = enter(f, groupsAt[gi]!);
        return (
          <div key={g.label} style={{ margin: "12px 18px 0", ...rise(p) }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <Label>{g.label}</Label>
              <span style={{ fontSize: 11, fontWeight: 800, color: C.ink3, background: C.surface2, borderRadius: 8, padding: "1px 7px" }}>{g.rows.length}</span>
            </div>
            <Card style={{ overflow: "hidden" }}>
              {g.rows.map((r, i) => (
                <div key={r.title} style={{ marginTop: i === 0 ? -1 : 0 }}>
                  <TaskRow r={r} p={enter(f, groupsAt[gi]! + 4 + i * 5)} />
                </div>
              ))}
            </Card>
          </div>
        );
      })}
      <BottomNav active={3} />
    </div>
  );
}

export function ActScreen({ f }: { f: number }) {
  const e = EV.agir;
  const done = f >= e.doneTap + 2;
  const burst = ramp(f, e.doneTap, e.doneTap + 16);
  const next = ramp(f, e.doneTap + 14, e.doneTap + 28);
  const list = ramp(f, e.list, e.list + 14);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: C.bg, opacity: 1 - list }}>
        <StatusBar />
        <TopBar back="Courriers" title={BILL.title} />
        <Card style={{ margin: "10px 18px", overflow: "hidden", border: `2px solid rgba(31,79,216,.4)` }}>
          <div style={{ background: C.primarySoft, color: C.primary, fontSize: 11, fontWeight: 800, letterSpacing: 1.2, padding: "9px 16px" }}>
            {next > 0.5 ? "PROCHAINE ÉTAPE" : "PROCHAINE ÉTAPE · PUIS 1 AUTRE"}
          </div>
          <div style={{ padding: "14px 16px 18px", position: "relative", minHeight: 150 }}>
            <div style={{ opacity: 1 - next, transform: `translateX(${-next * 40}px)` }}>
              <div style={{ fontSize: 20, fontWeight: 800, textDecoration: done ? "line-through" : "none", color: done ? C.ink3 : C.ink }}>Payer la facture d’électricité</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, fontSize: 13.5 }}>
                <Badge tone="warning">Dans 12 jours</Badge>
                <span style={{ color: C.ink2 }}>
                  avant le <Mark p={1}>9 novembre</Mark>
                </span>
                <span style={{ fontWeight: 800 }}>· {BILL.amount}</span>
              </div>
            </div>
            <div style={{ position: "absolute", left: 16, top: 14, right: 16, opacity: next, transform: `translateX(${(1 - next) * 40}px)` }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Vérifier le relevé du compteur</div>
              <div style={{ marginTop: 8 }}>
                <Badge>Dans 12 jours</Badge>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", borderRadius: 13, background: done ? C.success : C.primary, color: "#fff", fontSize: 14.5, fontWeight: 800 }}>
                <Icon name="check" size={16} color="#fff" stroke={3} /> {done ? "Fait" : "C’est fait"}
                {burst > 0 && burst < 1 ? <div style={{ position: "absolute", inset: -6, borderRadius: 18, border: `3px solid ${C.success}`, transform: `scale(${1 + burst * 0.3})`, opacity: 1 - burst }} /> : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderRadius: 13, border: `1px solid ${C.line}`, background: C.surface, color: C.ink2, fontSize: 14, fontWeight: 800 }}>
                <Icon name="copy" size={15} /> Copier l’IBAN
              </div>
            </div>
          </div>
        </Card>
        <Tap x={80} y={346} frame={f} at={e.doneTap} />
        <BottomNav active={1} />
      </div>
      {list > 0 ? (
        <Slide p={list}>
          <TodoList f={f} groupsAt={[e.g0, e.g1, e.g2]} />
        </Slide>
      ) : null}
    </div>
  );
}

/* ---------- 05 Ne rien oublier ---------- */

export function RemindScreen({ f }: { f: number }) {
  const e = EV.rappels;
  const notif = interpolate(f, [e.notif, e.notif + 10, e.calTap - 14, e.calTap - 4], [0, 1, 1, 0], clamp);
  const sheet = ramp(f, e.cal, e.cal + 14);
  const dots = [e.dot0, e.dot1, e.dot2].map((d) => enter(f, d, 30, 12));
  // Novembre 2026 commence un dimanche : 6 cases vides en semaine commençant le lundi.
  const days = Array.from({ length: 6 + 30 }, (_, i) => (i < 6 ? null : i - 5));
  const marked: Record<number, number> = { 1: 0, 3: 1, 9: 2 };
  const events = ["1 nov · Former opposition", "3 nov · Payer la prime de novembre", "9 nov · Facture d’électricité"];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ filter: `blur(${notif * 1.5}px)`, position: "absolute", inset: 0 }}>
        <TodoList f={999} groupsAt={[0, 0, 0]} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(17,24,39,${0.25 * Math.max(notif, sheet)})` }} />
      <div style={{ position: "absolute", left: 10, right: 10, top: 52, transform: `translateY(${(1 - notif) * -140}px)`, opacity: notif, padding: "12px 14px", borderRadius: 22, background: "rgba(250,250,252,.97)", boxShadow: "0 12px 30px rgba(0,0,0,.25)", display: "flex", gap: 10 }}>
        <LogoMark size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.ink3, fontWeight: 700 }}>
            <span>E-mail · Clair</span>
            <span>maintenant</span>
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 800, marginTop: 2 }}>Rappel : 2 échéances approchent</div>
          <div style={{ fontSize: 13, color: C.ink2, marginTop: 2, lineHeight: 1.35 }}>Former opposition au commandement de payer · Payer la prime de novembre</div>
        </div>
      </div>
      <Tap x={333} y={80} frame={f} at={e.calTap} />
      {sheet > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, bottom: 0, background: C.surface, borderRadius: "26px 26px 0 0", padding: "16px 20px", transform: `translateY(${(1 - sheet) * 640}px)`, boxShadow: "0 -10px 30px rgba(0,0,0,.15)" }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: C.line, margin: "0 auto 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Novembre</div>
            <Badge tone="success">
              <Icon name="check" size={12} stroke={3} /> 3 échéances ajoutées
            </Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginTop: 12, rowGap: 4, textAlign: "center" }}>
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 800, color: C.ink3 }}>
                {d}
              </div>
            ))}
            {days.map((d, i) => {
              const m = d !== null ? marked[d] : undefined;
              const p = m !== undefined ? dots[m]! : 0;
              return (
                <div key={i} style={{ height: 34, display: "grid", placeItems: "center", position: "relative" }}>
                  {d !== null ? (
                    <>
                      <div style={{ position: "absolute", width: 30, height: 30, borderRadius: 15, background: C.primary, transform: `scale(${p})` }} />
                      <span style={{ position: "relative", fontSize: 13.5, fontWeight: 700, color: p > 0.5 ? "#fff" : C.ink }}>{d}</span>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10 }}>
            {events.map((ev, i) => (
              <div key={ev} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", fontSize: 13.5, fontWeight: 700, ...rise(dots[i]!, 10) }}>
                <div style={{ width: 4, height: 22, borderRadius: 2, background: C.primary }} />
                {ev}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- 06 Répondre ---------- */

const TEMPLATES = [
  ["Résilier une assurance", "Caisse-maladie ou autre assurance."],
  ["Résilier un contrat ou un abonnement", "Téléphonie, internet, salle de sport…"],
  ["Contester une facture", "Montant erroné, prestation non reçue."],
  ["Demander un délai de paiement", "Ou un paiement échelonné."],
  ["Réclamer contre une taxation", "Décision d’impôts à contester."],
];
const REASON = "Le relevé du compteur est erroné.";

function Field({ label, value, flash, focus }: { label: string; value: string; flash?: number; focus?: boolean }) {
  return (
    <div style={{ margin: "0 18px 10px" }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink2, marginBottom: 4, display: "flex", gap: 6, alignItems: "center" }}>
        {label}
        {flash !== undefined && flash > 0.05 ? (
          <span style={{ opacity: flash }}>
            <Badge tone="primary">Rempli par Clair</Badge>
          </span>
        ) : null}
      </div>
      <div style={{ padding: "10px 12px", borderRadius: 12, border: `${focus ? 2 : 1}px solid ${focus ? C.primary : C.line}`, background: flash ? `rgba(255,216,77,${0.25 * (flash ?? 0)})` : C.surface, fontSize: 14.5, fontWeight: 600, minHeight: 20 }}>{value}</div>
    </div>
  );
}

export function LettersScreen({ f }: { f: number }) {
  const e = EV.lettres;
  const form = ramp(f, e.form, e.form + 12);
  const letter = ramp(f, e.letter, e.letter + 16);
  const prefill = interpolate(f, [e.form + 6, e.form + 14, e.typeStart + 30], [0, 1, 0.6], clamp);
  const reason = typed(REASON, f, e.typeStart, e.typeEnd);
  const pulse = interpolate(f, [e.langTap, e.langTap + 8, e.langTap + 22], [0, 1, 0], clamp);
  const pdf = enter(f, e.pdf, 30, 12);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - form }}>
        <StatusBar />
        <TopBar title="Préparer une lettre" />
        <div style={{ padding: "0 20px 10px", fontSize: 13, color: C.ink2, marginTop: -4 }}>Clair remplit ce qu’il peut à partir de votre courrier.</div>
        {TEMPLATES.map(([t, d], i) => {
          const p = enter(f, 4 + i * 6);
          const picked = f >= e.pick && i === 2;
          return (
            <div key={t} style={{ margin: "0 18px 8px", padding: "11px 14px", borderRadius: 16, background: C.surface, border: `${picked ? 2 : 1}px solid ${picked ? C.primary : C.line}`, ...rise(p, 16) }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14.5, fontWeight: 800, color: picked ? C.primary : C.ink }}>
                <Icon name="pen" size={15} /> {t}
              </div>
              <div style={{ fontSize: 12, color: C.ink2, marginTop: 2 }}>{d}</div>
            </div>
          );
        })}
        <Tap x={160} y={335} frame={f} at={e.pick} />
      </div>
      {form > 0 ? (
        <Slide p={form * (1 - letter * 0.15)}>
          <div style={{ position: "absolute", inset: 0, background: C.bg }}>
            <StatusBar />
            <TopBar back="Tous les modèles" title="Contester une facture" />
            <div style={{ margin: "0 18px 12px", display: "flex", padding: 3, borderRadius: 12, background: C.surface2, width: 220 }}>
              <div style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 10, background: C.surface, fontSize: 13, fontWeight: 800, boxShadow: "0 1px 3px rgba(0,0,0,.1)" }}>Français</div>
              <div style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 10, fontSize: 13, fontWeight: 800, color: C.ink2, background: `rgba(255,216,77,${pulse})`, transform: `scale(${1 + pulse * 0.06})` }}>Deutsch</div>
            </div>
            <Field label="Destinataire" value={BILL.sender} flash={prefill} />
            <Field label="N° de facture" value={BILL.invoice} flash={prefill} />
            <Field label="Montant facturé (CHF)" value="186.45" flash={prefill} />
            <Field label="Motif de la contestation" value={reason} focus={f >= e.typeStart && f < e.letter} />
            <div style={{ margin: "4px 18px", height: 48, borderRadius: 14, background: C.primary, color: "#fff", display: "grid", placeItems: "center", fontSize: 15.5, fontWeight: 800 }}>Préparer la lettre</div>
            <Tap x={195} y={555} frame={f} at={e.letter - 4} />
          </div>
        </Slide>
      ) : null}
      {letter > 0 ? (
        <div style={{ position: "absolute", left: 22, right: 22, top: 70, transform: `translateY(${(1 - letter) * 700}px) rotate(${(1 - letter) * 3}deg)`, background: "#fff", borderRadius: 6, boxShadow: "0 30px 60px rgba(17,24,39,.35)", padding: "22px 22px 26px", fontSize: 9.5, lineHeight: 1.5, color: "#14181F", fontFamily: "Helvetica, Arial, sans-serif" }}>
          <div style={{ fontSize: 8.5 }}>
            Sophie Martin
            <br />
            Rue du Lac 12
            <br />
            1003 Lausanne
          </div>
          <div style={{ marginLeft: "52%", marginTop: 14 }}>
            {BILL.sender}
            <br />
            Case postale
            <br />
            8000 Zürich
          </div>
          <div style={{ marginTop: 14 }}>Lausanne, le 28 octobre 2026</div>
          <div style={{ marginTop: 10, fontWeight: 700, fontSize: 10.5 }}>
            <Mark p={ramp(f, e.letter + 14, e.letter + 28)}>Contestation de la facture n° {BILL.invoice}</Mark>
          </div>
          <div style={{ marginTop: 10 }}>Madame, Monsieur,</div>
          <div style={{ marginTop: 8 }}>
            Je conteste la facture n° {BILL.invoice} d’un montant de CHF 186.45. Motif : le relevé du compteur est erroné. Je vous prie de bien vouloir la vérifier et de m’adresser une facture corrigée.
          </div>
          {[92, 86, 60].map((w, i) => (
            <div key={i} style={{ height: 4, width: `${w}%`, background: "#E5E7EB", borderRadius: 2, marginTop: 9 }} />
          ))}
          <div style={{ marginTop: 14 }}>Sophie Martin</div>
          <div style={{ position: "absolute", right: 14, bottom: -20, transform: `scale(${pdf})`, display: "flex", gap: 6, alignItems: "center", padding: "9px 14px", borderRadius: 14, background: C.ink, color: "#fff", fontSize: 13.5, fontWeight: 800, fontFamily: "inherit", boxShadow: "0 10px 24px rgba(0,0,0,.3)" }}>
            <Icon name="download" size={16} color="#fff" stroke={2.5} /> PDF prêt à signer
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- 07 Tout retrouver ---------- */

const DOCS = [
  { t: BILL.title, s: BILL.sender, c: "Facture", m: false },
  { t: "Nouvelle prime d’assurance-maladie", s: "Caisse-maladie Exemple SA", c: "Prime d’assurance", m: true },
  { t: "Commandement de payer", s: "Office des poursuites (exemple)", c: "Poursuite", m: false },
  { t: "Décompte de prestations", s: "Caisse-maladie Exemple SA", c: "Décompte", m: true },
  { t: "Décision de taxation 2025", s: "Administration fiscale (exemple)", c: "Impôts", m: false },
  { t: "Avis d’augmentation de loyer", s: "Régie Exemple SA", c: "Logement", m: false },
];

export function FindScreen({ f }: { f: number }) {
  const e = EV.retrouver;
  const q = typed("caisse", f, e.typeStart, e.typeEnd);
  const filter = ramp(f, e.filter, e.filter + 16);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg }}>
      <StatusBar />
      <TopBar title="Courriers" />
      <div style={{ padding: "0 20px", marginTop: -6, fontSize: 13, color: C.ink2 }}>{filter > 0.5 ? "2 courriers trouvés" : "24 courriers dans votre dossier"}</div>
      <div style={{ margin: "12px 18px", display: "flex", gap: 8, alignItems: "center", padding: "11px 14px", borderRadius: 14, background: C.surface, border: `${q ? 2 : 1}px solid ${q ? C.primary : C.line}` }}>
        <Icon name="search" size={18} color={C.ink3} />
        <span style={{ fontSize: 15, fontWeight: 600, color: q ? C.ink : C.ink3 }}>{q || "Rechercher par expéditeur, titre ou contenu"}</span>
        {q && q.length < 6 ? <span style={{ color: C.primary, fontWeight: 300, marginLeft: -6 }}>|</span> : null}
      </div>
      <Card style={{ margin: "0 18px", overflow: "hidden" }}>
        {DOCS.map((d, i) => {
          const hide = d.m ? 0 : filter;
          return (
            <div key={d.t} style={{ height: 66 * (1 - hide), opacity: 1 - hide, overflow: "hidden", borderTop: i ? `1px solid ${C.line}` : "none" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 14px" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: d.m && filter > 0.5 ? C.primarySoft : C.surface2, display: "grid", placeItems: "center", color: d.m && filter > 0.5 ? C.primary : C.ink2 }}>
                  <Icon name="doc" size={19} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.t}</div>
                  <div style={{ fontSize: 12, color: C.ink2, marginTop: 1 }}>
                    {d.m && filter > 0.5 ? <Mark p={ramp(filter, 0.5, 1)}>Caisse</Mark> : "Caisse".slice(0, 0)}
                    {d.m && filter > 0.5 ? d.s.slice(6) : d.s} · {d.c}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Card>
      <BottomNav active={1} />
    </div>
  );
}
