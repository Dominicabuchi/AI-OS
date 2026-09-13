export interface ModelRequest {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ModelResponse {
  text: string;
  provider: string;
  model: string;
}

export interface ModelProvider {

  readonly id: string;

  readonly name: string;

  generate(
    request: ModelRequest
  ): Promise<ModelResponse>;

}
