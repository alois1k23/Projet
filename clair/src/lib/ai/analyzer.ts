import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { env } from "@/lib/env";
import { AnalysisOutputSchema, normalizeAnalysis, type AnalysisOutput, type NormalizedAnalysis } from "./schema";
import { SYSTEM_PROMPT, userInstruction } from "./prompt";
import { mockAnalysis } from "./mock";

export type SupportedMime = "application/pdf" | "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export interface AnalyzeInput {
  content: Buffer;
  mimeType: SupportedMime;
  fileName: string;
  today?: Date;
}

export interface DocumentAnalyzer {
  readonly name: "anthropic" | "mock";
  analyze(input: AnalyzeInput): Promise<NormalizedAnalysis>;
}

export class AnalysisError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

export class AnthropicAnalyzer implements DocumentAnalyzer {
  readonly name = "anthropic" as const;

  constructor(
    private readonly client: Anthropic,
    private readonly model: string,
  ) {}

  async analyze({ content, mimeType, today = new Date() }: AnalyzeInput): Promise<NormalizedAnalysis> {
    const data = content.toString("base64");
    const fileBlock: Anthropic.Beta.BetaContentBlockParam =
      mimeType === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
        : { type: "image", source: { type: "base64", media_type: mimeType, data } };

    let response;
    try {
      response = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        output_config: { effort: "medium", format: betaZodOutputFormat(AnalysisOutputSchema) },
        messages: [{ role: "user", content: [fileBlock, { type: "text", text: userInstruction(today) }] }],
      });
    } catch (error) {
      throw toAnalysisError(error);
    }

    if (response.stop_reason === "refusal") {
      throw new AnalysisError("L’analyse automatique a été refusée pour ce document. Vous pouvez saisir les informations vous-même.", false);
    }
    if (response.stop_reason === "max_tokens") {
      throw new AnalysisError("Le document est trop long pour être analysé en une fois.", false);
    }
    const parsed = response.parsed_output as AnalysisOutput | null;
    if (!parsed) throw new AnalysisError("La réponse de l’analyse était illisible. Réessayez.", true);
    return normalizeAnalysis(parsed);
  }
}

function toAnalysisError(error: unknown): AnalysisError {
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return new AnalysisError("Le service d’analyse est mal configuré.", false);
  }
  if (error instanceof Anthropic.BadRequestError) {
    return new AnalysisError("Ce fichier n’a pas pu être lu. Essayez une photo plus nette ou un PDF.", false);
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AnalysisError("Le service d’analyse est très sollicité. Réessayez dans une minute.", true);
  }
  if (error instanceof Anthropic.APIConnectionError || error instanceof Anthropic.InternalServerError || error instanceof Anthropic.APIError) {
    return new AnalysisError("Le service d’analyse ne répond pas. Réessayez dans quelques instants.", true);
  }
  return new AnalysisError("L’analyse a échoué de façon inattendue.", true);
}

/** Analyseur de test : réponses déterministes, jamais utilisé sans activation explicite. */
export class MockAnalyzer implements DocumentAnalyzer {
  readonly name = "mock" as const;
  async analyze(input: AnalyzeInput): Promise<NormalizedAnalysis> {
    return normalizeAnalysis(mockAnalysis(input.fileName, input.today ?? new Date()));
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
