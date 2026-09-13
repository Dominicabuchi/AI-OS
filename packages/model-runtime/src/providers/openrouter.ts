import { SYSTEM_PROMPT } from "../prompts/system";

import {
  ModelProvider,
  ModelRequest,
  ModelResponse
} from "../types/provider";

type OpenRouterResponse = {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string | null;
    };
    finish_reason?: string | null;
  }>;
  error?: {
    message?: string;
    code?: string | number;
    metadata?: unknown;
  };
};

export class OpenRouterProvider implements ModelProvider {
  readonly id = "openrouter";
  readonly name = "OpenRouter";

  async generate(
    request: ModelRequest
  ): Promise<ModelResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is missing");
    }

    const timeoutMs = Number(
      process.env.AI_OS_MODEL_TIMEOUT_MS ?? 180_000
    );

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      timeoutMs
    );

    try {
      /*
       * Prevent catalog/model limits such as 65536 or 131072 from
       * becoming unnecessarily expensive OpenRouter reservations.
       */
      const configuredOutputCap =
        Number(
          process.env.AI_OS_MAX_OUTPUT_TOKENS ??
          1024
        );

      const effectiveMaxTokens =
        Math.max(
          256,
          Math.min(
            request.maxTokens ??
              configuredOutputCap,
            configuredOutputCap
          )
        );

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai-os.local",
            "X-Title": "AI-OS"
          },
          body: JSON.stringify({
            model: request.model,
            temperature: request.temperature ?? 0,
            max_tokens: effectiveMaxTokens,
            messages: [
              {
                role: "system",
                content: request.system ?? SYSTEM_PROMPT
              },
              {
                role: "user",
                content: request.prompt
              }
            ]
          })
        }
      );

      const raw = await response.text();

      let json: OpenRouterResponse;

      try {
        json = raw
          ? JSON.parse(raw) as OpenRouterResponse
          : {};
      } catch {
        throw new Error(
          `OpenRouter returned invalid JSON: HTTP ${response.status}`
        );
      }

      if (!response.ok) {
        const providerMessage =
          json.error?.message ??
          raw.slice(0, 1000) ??
          "unknown OpenRouter error";

        throw new Error(
          `OpenRouter HTTP ${response.status} for ${request.model}: ${providerMessage}`
        );
      }

      const choice = json.choices?.[0];
      const text = choice?.message?.content;

      if (
        typeof text !== "string" ||
        text.trim().length === 0
      ) {
        throw new Error(
          `OpenRouter returned empty content for ${request.model}; finish_reason=${choice?.finish_reason ?? "unknown"}`
        );
      }

      console.log(
        `[OpenRouterProvider] model=${request.model} resolved=${json.model ?? request.model} status=${response.status} chars=${text.length}`
      );

      return {
        text,
        provider: this.name,
        model: json.model ?? request.model
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          `OpenRouter request timed out after ${timeoutMs}ms for ${request.model}`
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
