from pathlib import Path
import re

root = Path.home() / "AI-OS"
provider = root / "packages/model-runtime/src/providers/openrouter.ts"
runtime = root / "packages/model-runtime/src/runtime/index.ts"

p = provider.read_text()

# Hard increase completion budget and timeout.
p = re.sub(r'process\.env\.AI_OS_MODEL_TIMEOUT_MS \?\?\s*[0-9_]+',
           'process.env.AI_OS_MODEL_TIMEOUT_MS ?? 600_000', p)
p = re.sub(r'process\.env\.AI_OS_MAX_OUTPUT_TOKENS \?\?\s*[0-9_]+',
           'process.env.AI_OS_MAX_OUTPUT_TOKENS ?? 8192', p)

# Replace any existing reasoning setting with a strict reasoning-token budget.
p = re.sub(r'reasoning:\s*\{[^\n]*\},',
           'reasoning: { max_tokens: 2048, exclude: true },', p)

# If no reasoning setting exists, insert it immediately before max_tokens.
if 'reasoning: { max_tokens: 2048, exclude: true },' not in p:
    p = p.replace(
        'temperature: request.temperature ?? 0,\n            max_tokens: effectiveMaxTokens,',
        'temperature: request.temperature ?? 0,\n            reasoning: { max_tokens: 2048, exclude: true },\n            max_tokens: effectiveMaxTokens,'
    )

# Force the final visible answer to be valid JSON where supported.
if 'response_format: { type: "json_object" },' not in p:
    p = p.replace(
        'reasoning: { max_tokens: 2048, exclude: true },\n            max_tokens: effectiveMaxTokens,',
        'reasoning: { max_tokens: 2048, exclude: true },\n            response_format: { type: "json_object" },\n            max_tokens: effectiveMaxTokens,'
    )

provider.write_text(p)

r = runtime.read_text()

# Guarantee tool-use gets a strong JSON/tool-capable path before the older Chinese-model pool.
anchor = '  const allCandidates = ['
if 'const taskSpecificCandidates =' not in r:
    r = r.replace(
        anchor,
        '  const taskSpecificCandidates =\n'
        '    taskFamily === "toolUse"\n'
        '      ? [\n'
        '          "openai/gpt-5.6-luna",\n'
        '          "z-ai/glm-5",\n'
        '          "anthropic/claude-haiku-4.5",\n'
        '        ]\n'
        '      : [];\n\n'
        '  const allCandidates = [\n'
        '    ...taskSpecificCandidates,'
    )
else:
    # Replace the existing tool-use candidate list deterministically.
    r = re.sub(
        r'  const taskSpecificCandidates =[\s\S]*?      : \[\];',
        '  const taskSpecificCandidates =\n'
        '    taskFamily === "toolUse"\n'
        '      ? [\n'
        '          "openai/gpt-5.6-luna",\n'
        '          "z-ai/glm-5",\n'
        '          "anthropic/claude-haiku-4.5",\n'
        '        ]\n'
        '      : [];',
        r,
        count=1,
    )

# Ensure free fallback still exists.
if '"openrouter/free"' not in r:
    r = r.replace('    ...selection.alternatives,', '    ...selection.alternatives,\n    "openrouter/free",')

runtime.write_text(r)

print('AI_OS_REASONING_JSON_FINAL_PATCH_APPLIED=true')
print('timeout_ms=600000')
print('max_output_tokens=8192')
print('reasoning_max_tokens=2048')
print('response_format=json_object')
print('tooluse_primary=openai/gpt-5.6-luna')
print('tooluse_fallback_1=z-ai/glm-5')
print('tooluse_fallback_2=anthropic/claude-haiku-4.5')
