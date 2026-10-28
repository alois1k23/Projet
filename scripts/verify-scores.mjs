// Vérifie la cohérence des données de l'étude et imprime le classement.
// Usage : node scripts/verify-scores.mjs [--markdown]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import assert from "node:assert/strict";

const dataPath = fileURLToPath(new URL("../dashboard/data.js", import.meta.url));
const sandbox = {};
vm.runInNewContext(readFileSync(dataPath, "utf8"), sandbox);
const { CRITERIA, SOURCES, IDEAS, SCENARIOS, RISKS } = sandbox.STUDY;

// --- Intégrité ---
assert.equal(CRITERIA.reduce((s, c) => s + c.weight, 0), 100, "les pondérations doivent totaliser 100 %");
assert.equal(IDEAS.length, 15, "15 idées attendues");
const sourceIds = new Set(SOURCES.map((s) => s.id));
for (const idea of IDEAS) {
  for (const c of CRITERIA) {
    const v = idea.scores[c.key];
    assert.ok(Number.isInteger(v) && v >= 0 && v <= 10, `${idea.id}.${c.key} hors bornes`);
  }
  for (const s of idea.sources) assert.ok(sourceIds.has(s), `${idea.id} cite une source inconnue ${s}`);
  for (const k of idea.obs) assert.ok(k in idea.scores, `${idea.id} marque un critère inconnu ${k}`);
}
for (const r of RISKS) assert.ok(IDEAS.some((i) => i.id === r.idea), `risque lié à une idée inconnue ${r.idea}`);
for (const id of Object.keys(SCENARIOS)) assert.ok(IDEAS.some((i) => i.id === id), `scénario inconnu ${id}`);

// --- Scores (même formule que le dashboard) ---
export const score = (idea, weights) => {
  const total = CRITERIA.reduce((s, c) => s + weights[c.key], 0);
  return (CRITERIA.reduce((s, c) => s + idea.scores[c.key] * weights[c.key], 0) / total) * 10;
};
const base = Object.fromEntries(CRITERIA.map((c) => [c.key, c.weight]));
const ranked = IDEAS.map((i) => ({ ...i, total: score(i, base) })).sort((a, b) => b.total - a.total);

// --- Robustesse : pondérations perturbées aléatoirement de ±50 % ---
let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const RUNS = 5000;
const wins = Object.fromEntries(IDEAS.map((i) => [i.id, 0]));
const top3 = Object.fromEntries(IDEAS.map((i) => [i.id, 0]));
for (let r = 0; r < RUNS; r++) {
  const w = Object.fromEntries(CRITERIA.map((c) => [c.key, c.weight * (0.5 + rand())]));
  const order = IDEAS.map((i) => ({ id: i.id, t: score(i, w) })).sort((a, b) => b.t - a.t);
  wins[order[0].id]++;
  order.slice(0, 3).forEach((o) => top3[o.id]++);
}

// --- Robustesse : incertitude sur les notes elles-mêmes ---
// Notes estimées : ±1,5 point ; notes appuyées sur une source : ±0,5 point.
const winsNoise = Object.fromEntries(IDEAS.map((i) => [i.id, 0]));
for (let r = 0; r < RUNS; r++) {
  const order = IDEAS.map((i) => {
    const noisy = { scores: {} };
    for (const c of CRITERIA) {
      const amp = i.obs.includes(c.key) ? 0.5 : 1.5;
      noisy.scores[c.key] = Math.min(10, Math.max(0, i.scores[c.key] + (rand() * 2 - 1) * amp));
    }
    return { id: i.id, t: score(noisy, base) };
  }).sort((a, b) => b.t - a.t);
  winsNoise[order[0].id]++;
}

const md = process.argv.includes("--markdown");
if (md) {
  console.log("| Rang | Idée | Score /100 | 1er si pondérations ±50 % | Top 3 si pondérations ±50 % | 1er si notes incertaines |");
  console.log("|---:|---|---:|---:|---:|---:|");
}
ranked.forEach((i, n) => {
  const w = ((wins[i.id] / RUNS) * 100).toFixed(0);
  const t = ((top3[i.id] / RUNS) * 100).toFixed(0);
  const n2 = ((winsNoise[i.id] / RUNS) * 100).toFixed(0);
  if (md) console.log(`| ${n + 1} | ${i.name} — ${i.tagline} | ${i.total.toFixed(1)} | ${w} % | ${t} % | ${n2} % |`);
  else console.log(`${String(n + 1).padStart(2)}. ${i.total.toFixed(1).padStart(5)}  ${i.name.padEnd(10)} 1er:${w.padStart(3)}%  top3:${t.padStart(3)}%  1er(notes±):${n2.padStart(3)}%`);
});
console.log(md ? "" : "\nOK : intégrité des données vérifiée.");
