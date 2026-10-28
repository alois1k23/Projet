import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { env } from "@/lib/env";
import { AnalysisOutputSchema, normalizeAnalysis, type AnalysisOutput, type NormalizedAnalysis } from "./schema";
import { SYSTEM_PROMPT, userInstruction } from "./prompt";
import { mockAnalysis } from "./mock";

export type SupportedMime = "application/pdf" | "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export interface PageInput {
  content: Buffer;
  mimeType: SupportedMime;
}

export interface AnalyzeInput {
  /** Pages du courrier, dans l'ordre (photos et/ou PDF). */
  pages: PageInput[];
  fileName: string;
  today?: Date;
  /** Langue dans laquelle rédiger l'explication. */
  locale?: "fr" | "de";
}

export const MAX_PAGES = 10;

export interface DocumentAnalyzer {
  readonly name: "anthropic" | "mock";
  analyze(input: AnalyzeInput): Promise<NormalizedAnalysis>;
}

export type AnalysisErrorCode = "noPages" | "refused" | "tooLong" | "unreadable" | "misconfigured" | "badFile" | "busy" | "down" | "unexpected";

/** Erreur d'analyse. `code` est une clé de traduction (`analysisErrors.*`). */
export class AnalysisError extends Error {
  constructor(
    readonly code: AnalysisErrorCode,
    readonly retryable: boolean,
  ) {
    super(code);
    this.name = "AnalysisError";
  }
}

export class AnthropicAnalyzer implements DocumentAnalyzer {
  readonly name = "anthropic" as const;

  constructor(
    private readonly client: Anthropic,
    private readonly model: string,
  ) {}

  async analyze({ pages, today = new Date(), locale = "fr" }: AnalyzeInput): Promise<NormalizedAnalysis> {
    if (pages.length === 0) throw new AnalysisError("noPages", false);
    const fileBlocks: Anthropic.Beta.BetaContentBlockParam[] = pages.map(({ content, mimeType }) => {
      const data = content.toString("base64");
      return mimeType === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
        : { type: "image", source: { type: "base64", media_type: mimeType, data } };
    });

    let response;
    try {
      response = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        output_config: { effort: "medium", format: betaZodOutputFormat(AnalysisOutputSchema) },
        messages: [{ role: "user", content: [...fileBlocks, { type: "text", text: userInstruction(today, pages.length, locale) }] }],
      });
    } catch (error) {
      throw toAnalysisError(error);
    }

    if (response.stop_reason === "refusal") {
      throw new AnalysisError("refused", false);
    }
    if (response.stop_reason === "max_tokens") {
      throw new AnalysisError("tooLong", false);
    }
    const parsed = response.parsed_output as AnalysisOutput | null;
    if (!parsed) throw new AnalysisError("unreadable", true);
    return normalizeAnalysis(parsed);
  }
}

function toAnalysisError(error: unknown): AnalysisError {
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return new AnalysisError("misconfigured", false);
  }
  if (error instanceof Anthropic.BadRequestError) {
    return new AnalysisError("badFile", false);
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AnalysisError("busy", true);
  }
  if (error instanceof Anthropic.APIConnectionError || error instanceof Anthropic.InternalServerError || error instanceof Anthropic.APIError) {
    return new AnalysisError("down", true);
  }
  return new AnalysisError("unexpected", true);
}

/** Analyseur de test : réponses déterministes, jamais utilisé sans activation explicite. */
export class MockAnalyzer implements DocumentAnalyzer {
  readonly name = "mock" as const;
  async analyze(input: AnalyzeInput): Promise<NormalizedAnalysis> {
    return normalizeAnalysis(mockAnalysis(input.fileName, input.today ?? new Date(), input.locale));
  }
}

/**
 * Retourne l’analyseur configuré, ou null si l’analyse automatique est indisponible.
 * Dans ce cas l’application fonctionne en saisie manuelle.
 */
export function getAnalyzer(): DocumentAnalyzer | null {
  const e = env();
  if (e.CLAIR_AI_PROVIDER === "mock") return new MockAnalyzer();
  if (!e.ANTHROPIC_API_KEY) return null;
  return new AnthropicAnalyzer(new Anthropic({ apiKey: e.ANTHROPIC_API_KEY, timeout: 120_000, maxRetries: 2 }), e.CLAIR_AI_MODEL);
}
