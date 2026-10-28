import { ImageResponse } from "next/og";

export const alt = "Clair — votre courrier administratif, enfin clair";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage (réseaux sociaux, messageries). Texte bilingue pour servir les deux langues à la même adresse. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4f5f7", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#1f4fd8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 34, height: 44, borderRadius: 4, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 8, borderRadius: 2, background: "#ffd84d" }} />
            </div>
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#111827" }}>clair</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, fontWeight: 800, color: "#111827", lineHeight: 1.05, display: "flex", flexWrap: "wrap" }}>
            Votre courrier administratif,&nbsp;<span style={{ background: "#ffd84d", padding: "0 10px" }}>enfin clair.</span>
          </div>
          <div style={{ fontSize: 36, color: "#5f6877" }}>Ihre Behördenpost, endlich klar.</div>
        </div>
        <div style={{ fontSize: 26, color: "#1f4fd8", fontWeight: 700 }}>Factures QR · LAMal · impôts · poursuites — pour les ménages en Suisse</div>
      </div>
    ),
    size,
  );
}
