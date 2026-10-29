// Rend un post TikTok : image, habillage sonore synchronisé, version avec son et version muette.
// Usage : node render-post.mjs <composition> <cues.json> <script-son.py> <nom-de-sortie>
//   ex. node render-post.mjs ClairLamal src/lamal/cues.json sound/lamal.py clair-lamal
// STILLS=10,200 pour des images fixes de contrôle ; CONCURRENCY=2 par défaut (mémoire).
import path from "node:path";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const [id, cues, soundScript, name] = process.argv.slice(2);
if (!id || !cues || !soundScript || !name) throw new Error("Usage : node render-post.mjs <composition> <cues.json> <script-son.py> <nom>");
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });

if (process.env.STILLS) {
  for (const frame of String(process.env.STILLS).split(",").map(Number)) {
    await renderStill({ composition, serveUrl, frame, output: `out/stills/${name}-${frame}.png`, browserExecutable });
  }
  process.exit(0);
}

const raw = `out/.${name}-raw.mp4`;
const wav = `out/.${name}.wav`;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  crf: 16,
  outputLocation: raw,
  concurrency: Number(process.env.CONCURRENCY || 2),
  browserExecutable,
});
const ffmpeg = (args) => execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const video = ["-vf", "scale=out_range=tv,format=yuv420p", "-color_range", "tv", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-movflags", "+faststart"];
ffmpeg(["-i", raw, ...video, "-an", `out/${name}-muet.mp4`]);
execFileSync("python3", [soundScript, cues, wav], { stdio: "inherit" });
ffmpeg(["-i", raw, "-i", wav, ...video, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", `out/${name}.mp4`]);
for (const f of [raw, wav]) if (existsSync(f)) rmSync(f);
console.log(`out/${name}.mp4\nout/${name}-muet.mp4`);
