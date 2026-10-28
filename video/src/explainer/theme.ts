import { Easing, interpolate, spring } from "remotion";
import CUES from "./cues.json";

/** Palette de Clair (DESIGN_SYSTEM.md). */
export const C = {
  ink: "#111827",
  ink2: "#4B5563",
  ink3: "#6B7280",
  bg: "#F4F5F7",
  bg2: "#ECEEF2",
  surface: "#FFFFFF",
  surface2: "#F1F3F6",
  line: "#E3E6EB",
  primary: "#1F4FD8",
  primaryDeep: "#173CA8",
  primarySoft: "#E6ECFC",
  mark: "#FFD84D",
  markSoft: "#FFF6D1",
  success: "#176C41",
  successSoft: "#E3F3EA",
  warning: "#8A5A00",
  warningSoft: "#FDF3D7",
  danger: "#B42318",
  dangerSoft: "#FDE8E6",
  night: "#0B0F17",
};

export const FONT = '"Manrope Variable", "Manrope", system-ui, sans-serif';
export const MONO = '"DejaVu Sans Mono", ui-monospace, Menlo, monospace';

export type ChapterId = (typeof CUES.chapters)[number]["id"];
export const CHAPTERS = CUES.chapters;
export const chapter = (id: string) => CUES.chapters.find((c) => c.id === id)!;
export const EV = CUES.events;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Ressort amorti, sans rebond excessif : le mouvement doit rester sobre. */
export function enter(frame: number, delay: number, fps = 30, damping = 20) {
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7, stiffness: 140 } });
}

/** Progression 0 → 1 entre deux images, avec une courbe douce. */
export function ramp(frame: number, from: number, to: number, ease = Easing.bezier(0.22, 1, 0.36, 1)) {
  return interpolate(frame, [from, to], [0, 1], { ...clamp, easing: ease });
}

/** Texte « tapé » : nombre de caractères visibles. */
export function typed(text: string, frame: number, from: number, to: number) {
  return text.slice(0, Math.round(interpolate(frame, [from, to], [0, text.length], clamp)));
}
