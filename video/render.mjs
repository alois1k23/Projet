// Rend les trois versions de la vidéo TikTok dans out/.
// Usage : npm run render [-- fr] ; REMOTION_BROWSER=/chemin/vers/chrome pour utiliser un navigateur déjà installé.
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renameSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const langs = process.argv.slice(2).filter((a) => ["fr", "de", "en"].includes(a));
const targets = langs.length ? langs : ["fr", "de", "en"];
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });

for (const lang of targets) {
  const id = `ClairTikTok-${lang}`;
  const composition = await selectComposition({ serveUrl, id, inputProps: { lang }, browserExecutable });
  if (process.env.STILLS) {
    for (const frame of String(process.env.STILLS).split(",").map(Number)) {
      await renderStill({ composition, serveUrl, frame, output: `out/stills/${lang}-${frame}.png`, inputProps: { lang }, browserExecutable });
    }
    continue;
  }
  const output = `out/clair-tiktok-${lang}.mp4`;
  await renderMedia({ composition, serveUrl, codec: "h264", crf: 18, outputLocation: output, inputProps: { lang }, browserExecutable, onProgress: ({ progress }) => { if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`\r${id} ${Math.round(progress * 100)} %`); } });
  // Couleurs en plage standard (yuv420p) et lecture progressive, comme l'attendent TikTok et les téléphones.
  const tmp = output.replace(".mp4", ".tmp.mp4");
  renameSync(output, tmp);
  execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-vf", "scale=out_range=tv,format=yuv420p", "-color_range", "tv", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", output], { stdio: "inherit" });
  execFileSync("rm", [tmp]);
  console.log(`\n${output}`);
}
