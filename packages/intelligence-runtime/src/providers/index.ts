import { IntelligenceProvider } from "./provider";

import { MemoryProvider } from "./memory-provider";
import { ResearchProvider } from "./research-provider";
import { KnowledgeProvider } from "./knowledge-provider";
import { EnvironmentProvider } from "./environment-provider";
import { FilesProvider } from "./files-provider";
import { BrowserProvider } from "./browser-provider";
import { PreferencesProvider } from "./preferences-provider";
import { ReasoningProvider } from "./reasoning-provider";
import { SharedProvider } from "./shared-provider";
import { EOIPProvider } from "./eoip-provider";

const providers =
  new Map<string, IntelligenceProvider>();

export function registerProvider(
  provider: IntelligenceProvider
): void {

  providers.set(
    provider.id,
    provider
  );

}

registerProvider(new MemoryProvider());
registerProvider(new ResearchProvider());
registerProvider(new KnowledgeProvider());
registerProvider(new EnvironmentProvider());
registerProvider(new FilesProvider());
registerProvider(new BrowserProvider());
registerProvider(new PreferencesProvider());
registerProvider(new ReasoningProvider());
registerProvider(new SharedProvider());
registerProvider(new EOIPProvider());

export function getProviders(): IntelligenceProvider[] {
  return [...providers.values()];
}

export * from "./provider";
export * from "./memory-provider";
export * from "./research-provider";
export * from "./knowledge-provider";
export * from "./environment-provider";
export * from "./files-provider";
export * from "./browser-provider";
export * from "./preferences-provider";
export * from "./reasoning-provider";
export * from "./shared-provider";
export * from "./eoip-provider";
