import "@fontsource-variable/manrope";
import { Composition } from "remotion";
import { ClairAd, DURATION, type AdProps } from "./ClairAd";

export const Root = () => (
  <>
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
