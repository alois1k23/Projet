import { describe, expect, it } from "vitest";
import { jpegName, needsPreparation, targetSize } from "@/lib/prepare-image";

describe("préparation des photos avant envoi", () => {
  it("convertit les formats non pris en charge et les photos lourdes, pas les PDF", () => {
    expect(needsPreparation({ type: "image/heic", size: 900_000, name: "IMG_1234.HEIC" })).toBe(true);
    expect(needsPreparation({ type: "", size: 900_000, name: "IMG_1234.heic" })).toBe(true);
    expect(needsPreparation({ type: "image/jpeg", size: 4_000_000, name: "a.jpg" })).toBe(true);
    expect(needsPreparation({ type: "image/jpeg", size: 800_000, name: "a.jpg" })).toBe(false);
    expect(needsPreparation({ type: "application/pdf", size: 9_000_000, name: "a.pdf" })).toBe(false);
    expect(needsPreparation({ type: "text/plain", size: 10, name: "a.txt" })).toBe(false);
  });

  it("réduit en gardant les proportions, sans jamais agrandir", () => {
    expect(targetSize(4032, 3024)).toEqual({ width: 2400, height: 1800 });
    expect(targetSize(3024, 4032)).toEqual({ width: 1800, height: 2400 });
    expect(targetSize(1200, 800)).toEqual({ width: 1200, height: 800 });
  });

  it("renomme en .jpg", () => {
    expect(jpegName("IMG_1234.HEIC")).toBe("IMG_1234.jpg");
    expect(jpegName("facture.scan.png")).toBe("facture.scan.jpg");
    expect(jpegName(".heic")).toBe("courrier.jpg");
  });
});
