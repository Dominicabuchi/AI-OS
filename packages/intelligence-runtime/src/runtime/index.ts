import {
  Intelligence,
  IntelligenceRequest
} from "../types";

import {
  getProviders,
  ProviderResult
} from "../providers";

export async function buildIntelligence(
  request: IntelligenceRequest
): Promise<Intelligence> {

  const providers = getProviders();

  const results: ProviderResult[] =
    await Promise.all(

      providers.map(async provider => ({

        id: provider.id,

        data: await provider.collect(request)

      }))

    );

  const intelligence: Intelligence = {};

  for (const result of results) {

    intelligence[result.id] =
      result.data;

  }

  return intelligence;

}
