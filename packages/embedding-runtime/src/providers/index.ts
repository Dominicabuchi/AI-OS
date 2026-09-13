import {
  EmbeddingProvider
} from "../types";

import { DefaultEmbeddingProvider }
from "./default-provider";

const providers =
  new Map<string, EmbeddingProvider>();

export function registerProvider(
  provider: EmbeddingProvider
): void {

  providers.set(
    provider.id,
    provider
  );

}

registerProvider(
  new DefaultEmbeddingProvider()
);

export function getProvider(
  id: string
): EmbeddingProvider {

  const provider =
    providers.get(id);

  if (!provider) {
    throw new Error(
      `Embedding provider '${id}' not found.`
    );
  }

  return provider;

}

export function getProviders() {
  return [...providers.values()];
}

export * from "./default-provider";
