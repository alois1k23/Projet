import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import { AnalysisError, AnthropicAnalyzer, MockAnalyzer } from "@/lib/ai/analyzer";
import { mockAnalysis } from "@/lib/ai/mock";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";

const today = new Date("2026-10-28T00:00:00Z");

function fakeClient(result: unknown) {
  const parse = vi.fn().mockImplementation(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  return { client: { beta: { messages: { parse } } } as unknown as Anthropic, parse };
}

describe("AnthropicAnalyzer", () => {
  it("envoie un PDF comme bloc document avec sortie structurée et fallbacks", async () => {
    const { client, parse } = fakeClient({ stop_reason: "end_turn", parsed_output: mockAnalysis("x", today) });
    const analyzer = new AnthropicAnalyzer(client, "claude-opus-5-5");
    const result = await analyzer.analyze({ pages: [{ content: Buffer.from("%PDF-1.7"), mimeType: "application/pdf" }], fileName: "a.pdf", today });

    expect(result.title).toBe("Nouvelle prime d’assurance-maladie 2027");
    const params = parse.mock.calls[0]![0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.system).toBe(SYSTEM_PROMPT);
    expect(params.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(params.fallbacks).toBe("default");
    expect(params.output_config.effort).toBe("medium");
    expect(params.output_config.format).toBeDefined();
    const [file, text] = params.messages[0].content;
    expect(file.type).toBe("document");
    expect(file.source.media_type).toBe("application/pdf");
    expect(text.text).toContain("2026-10-28");
  });

  it("envoie toutes les pages d’un courrier, dans l’ordre", async () => {
    const { client, parse } = fakeClient({ stop_reason: "end_turn", parsed_output: mockAnalysis("x", today) });
    await new AnthropicAnalyzer(client, "m").analyze({
      pages: [
        { content: Buffer.from([1]), mimeType: "image/jpeg" },
        { content: Buffer.from([2]), mimeType: "image/png" },
        { content: Buffer.from("%PDF"), mimeType: "application/pdf" },
      ],
      fileName: "a.jpg",
      today,
    });
    const content = parse.mock.calls[0]![0].messages[0].content;
    expect(content.map((b: { type: string }) => b.type)).toEqual(["image", "image", "document", "text"]);
    expect(content[3].text).toContain("3 pages");
  });

  it("refuse un courrier sans page", async () => {
    const { client } = fakeClient({ stop_reason: "end_turn", parsed_output: null });
    await expect(new AnthropicAnalyzer(client, "m").analyze({ pages: [], fileName: "x", today })).rejects.toBeInstanceOf(AnalysisError);
  });

  it("envoie une photo comme bloc image", async () => {
    const { client, parse } = fakeClient({ stop_reason: "end_turn", parsed_output: mockAnalysis("x", today) });
    await new AnthropicAnalyzer(client, "m").analyze({ pages: [{ content: Buffer.from([1, 2, 3]), mimeType: "image/jpeg" }], fileName: "a.jpg", today });
    const [file] = parse.mock.calls[0]![0].messages[0].content;
    expect(file).toMatchObject({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: "AQID" } });
  });

  it("transforme un refus en erreur non réessayable", async () => {
    const { client } = fakeClient({ stop_reason: "refusal", parsed_output: null });
    await expect(new AnthropicAnalyzer(client, "m").analyze({ pages: [{ content: Buffer.from("x"), mimeType: "image/png" }], fileName: "a", today })).rejects.toMatchObject({
      name: "AnalysisError",
      retryable: false,
    });
  });

  it("signale une réponse illisible comme réessayable", async () => {
    const { client } = fakeClient({ stop_reason: "end_turn", parsed_output: null });
    await expect(new AnthropicAnalyzer(client, "m").analyze({ pages: [{ content: Buffer.from("x"), mimeType: "image/png" }], fileName: "a", today })).rejects.toMatchObject({ retryable: true });
  });

  it("traduit les erreurs réseau en message compréhensible", async () => {
    const { client } = fakeClient(new Anthropic.APIConnectionError({ message: "socket hang up" }));
    const promise = new AnthropicAnalyzer(client, "m").analyze({ pages: [{ content: Buffer.from("x"), mimeType: "image/png" }], fileName: "a", today });
    await expect(promise).rejects.toBeInstanceOf(AnalysisError);
    await expect(promise).rejects.toMatchObject({ code: "down", retryable: true });
  });
});

describe("MockAnalyzer", () => {
  it("retourne un scénario « à vérifier » pour une photo floue", async () => {
    const result = await new MockAnalyzer().analyze({ pages: [{ content: Buffer.from("x"), mimeType: "image/png" }], fileName: "facture-flou.png", today });
    expect(result.needsReview).toBe(true);
  });
});
