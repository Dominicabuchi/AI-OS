import {
  EmbeddingProvider,
  EmbeddingRequest
} from "../types";

export class DefaultEmbeddingProvider
implements EmbeddingProvider {

  readonly id = "default";

  async generate(
    request: EmbeddingRequest
  ): Promise<number[]> {

    const text =
      request.text.toLowerCase();

    return Array.from(text)
      .slice(0, 256)
      .map(char =>
        char.charCodeAt(0) / 255
      );

  }

}
