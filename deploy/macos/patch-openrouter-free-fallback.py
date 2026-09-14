#!/usr/bin/env python3
from pathlib import Path

p = Path.home() / "AI-OS/packages/model-runtime/src/runtime/index.ts"
s = p.read_text()

old = '''  const allCandidates = [
    selection.model,
    ...selection.alternatives,
  ].filter(
    (model, index, models) =>
      models.indexOf(model) === index,
  );
'''

new = '''  /*
   * Keep the quality-ranked paid/current models first, but always retain
   * OpenRouter's zero-cost router as the final compatibility fallback.
   * This lets AI-OS continue operating when account credits are exhausted
   * without changing normal model selection when paid capacity is available.
   */
  const freeFallbackModel =
    process.env.AI_OS_OPENROUTER_FREE_FALLBACK ??
    "openrouter/free";

  const allCandidates = [
    selection.model,
    ...selection.alternatives,
    freeFallbackModel,
  ].filter(
    (model, index, models) =>
      models.indexOf(model) === index,
  );
'''

if new in s:
    print("AI_OS_OPENROUTER_FREE_FALLBACK_ALREADY_APPLIED=true")
    raise SystemExit(0)

if old not in s:
    raise SystemExit("ERROR: expected model candidate block not found; refusing unsafe patch")

p.write_text(s.replace(old, new, 1))
print("AI_OS_OPENROUTER_FREE_FALLBACK_PATCH_APPLIED=true")
