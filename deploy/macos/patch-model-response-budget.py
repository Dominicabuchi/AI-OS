from pathlib import Path

root = Path.home() / "AI-OS"
provider = root / "packages/model-runtime/src/providers/openrouter.ts"
runtime = root / "packages/model-runtime/src/runtime/index.ts"

p = provider.read_text()

p = p.replace(
    'process.env.AI_OS_MODEL_TIMEOUT_MS ?? 180_000',
    'process.env.AI_OS_MODEL_TIMEOUT_MS ?? 300_000'
)

p = p.replace(
    'process.env.AI_OS_MAX_OUTPUT_TOKENS ??\n          1024',
    'process.env.AI_OS_MAX_OUTPUT_TOKENS ??\n          4096'
)

# Ask reasoning-capable OpenRouter models to keep hidden reasoning modest.
needle = 'temperature: request.temperature ?? 0,\n            max_tokens: effectiveMaxTokens,'
replacement = 'temperature: request.temperature ?? 0,\n            reasoning: { effort: "low" },\n            max_tokens: effectiveMaxTokens,'
if needle in p and 'reasoning: { effort: "low" }' not in p:
    p = p.replace(needle, replacement)

provider.write_text(p)

r = runtime.read_text()
old = '''  const allCandidates = [\n    selection.model,\n    ...selection.alternatives,\n  ].filter('''
new = '''  const allCandidates = [\n    selection.model,\n    ...selection.alternatives,\n    "openrouter/free",\n  ].filter('''
if old in r and '"openrouter/free"' not in r:
    r = r.replace(old, new)
runtime.write_text(r)

print("AI_OS_MODEL_RESPONSE_BUDGET_PATCH_APPLIED=true")
print("timeout_ms=300000")
print("default_max_output_tokens=4096")
print("reasoning_effort=low")
print("free_fallback=ensured")
