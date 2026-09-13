import { ModelProvider } from "../types/provider";

const providers = new Map<string, ModelProvider>();

export function register(provider: ModelProvider) {
  providers.set(provider.id, provider);
}

export function getProvider(id: string) {
  return providers.get(id);
}

export function listProviders() {
  return [...providers.values()];
}
