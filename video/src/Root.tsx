import "@fontsource-variable/manrope";
import { Composition } from "remotion";
import { ClairAd, DURATION, type AdProps } from "./ClairAd";
import { ClairExplainer, EXPLAINER_DURATION } from "./explainer/Explainer";

export const Root = () => (
  <>
    <Composition id="ClairExplicatif" component={ClairExplainer} durationInFrames={EXPLAINER_DURATION} fps={30} width={1080} height={1920} />
    {(["fr", "de", "en"] as const).map((lang) => (
      <Composition
        key={lang}
        id={`ClairTikTok-${lang}`}
        component={ClairAd}
        durationInFrames={DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ lang }}
      />
    ))}
  </>
);
