// Rend la vidéo explicative (FR) : image, puis habillage sonore et assemblage final.
// Usage : npm run render:explainer ; STILLS=10,200 pour des images fixes de contrôle.
import path from "node:path";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "ClairExplicatif", browserExecutable });

if (process.env.STILLS) {
  for (const frame of String(process.env.STILLS).split(",").map(Number)) {
    await renderStill({ composition, serveUrl, frame, output: `out/stills/explicatif-${frame}.png`, browserExecutable });
  }
  process.exit(0);
}

const silentRaw = "out/.explicatif-raw.mp4";
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  crf: 16,
  outputLocation: silentRaw,
  concurrency: Number(process.env.CONCURRENCY || 2),
  browserExecutable,
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 20 === 0) process.stdout.write(`\rimage ${Math.round(progress * 100)} %`);
  },
});

const ffmpeg = (args) => execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const video = ["-vf", "scale=out_range=tv,format=yuv420p", "-color_range", "tv", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-movflags", "+faststart"];

// Version muette (pour poser une musique dans TikTok).
ffmpeg(["-i", silentRaw, ...video, "-an", "out/clair-explicatif-muet.mp4"]);

// Habillage sonore généré à partir des mêmes repères que l'animation.
execFileSync("python3", ["sound/soundtrack.py", "src/explainer/cues.json", "out/.explicatif.wav"], { stdio: "inherit" });
ffmpeg(["-i", silentRaw, "-i", "out/.explicatif.wav", ...video, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "out/clair-explicatif.mp4"]);

for (const f of [silentRaw, "out/.explicatif.wav"]) if (existsSync(f)) rmSync(f);
console.log("\nout/clair-explicatif.mp4\nout/clair-explicatif-muet.mp4");
