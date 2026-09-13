import {
  getProvider,
  registerProvider
} from "../providers";

import { DefaultEmbeddingProvider }
from "../providers/default-provider";

registerProvider(
  new DefaultEmbeddingProvider()
);

export async function embed(
  text: string
): Promise<number[]> {

  return getProvider("default")
    .generate({ text });

}

export function cosineSimilarity(
  a: number[],
  b: number[]
): number {

  const len =
    Math.min(a.length, b.length);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i++) {

    dot += a[i] * b[i];

    magA += a[i] * a[i];

    magB += b[i] * b[i];

  }

  return dot /
    (
      Math.sqrt(magA) *
      Math.sqrt(magB)
    );

}
