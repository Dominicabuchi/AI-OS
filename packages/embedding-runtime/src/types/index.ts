export interface EmbeddingRequest {
  text: string;
}

export interface EmbeddingProvider {
  id: string;

  generate(
    request: EmbeddingRequest
  ): Promise<number[]>;
}
