from pathlib import Path

root = Path.home() / "AI-OS"
provider = root / "packages/model-runtime/src/providers/openrouter.ts"
runtime = root / "packages/model-runtime/src/runtime/index.ts"

p = provider.read_text()

# Tool-execution turns need concise executable JSON, not long hidden reasoning.
p = p.replace(
    'reasoning: { effort: "low" },',
    'reasoning: { effort: "none", exclude: true },'
)

# Keep enough room for JSON actions/results while preventing runaway output.
p = p.replace(
    'process.env.AI_OS_MAX_OUTPUT_TOKENS ??\n          4096',
    'process.env.AI_OS_MAX_OUTPUT_TOKENS ??\n          4096'
)

provider.write_text(p)

r = runtime.read_text()

old = '''  const allCandidates = [\n    selection.model,\n    ...selection.alternatives,\n    "openrouter/free",\n  ].filter('''
new = '''  const taskSpecificCandidates =\n    taskFamily === "toolUse"\n      ? [\n          "z-ai/glm-5.3-flash:free",\n          "deepseek/deepseek-v4-flash-0731",\n          "openai/gpt-5.6-luna",\n        ]\n      : [];\n\n  const allCandidates = [\n    ...taskSpecificCandidates,\n    selection.model,\n    ...selection.alternatives,\n    "openrouter/free",\n  ].filter('''

if old in r:
    r = r.replace(old, new)
elif 'const taskSpecificCandidates =' not in r:
    old2 = '''  const allCandidates = [\n    selection.model,\n    ...selection.alternatives,\n  ].filter('''
    if old2 in r:
        r = r.replace(old2, new)
    else:
        raise SystemExit("Could not locate allCandidates block")

runtime.write_text(r)

print("AI_OS_TOOLUSE_FINAL_PATCH_APPLIED=true")
print("tooluse_primary=z-ai/glm-5.3-flash:free")
print("tooluse_fallback_1=deepseek/deepseek-v4-flash-0731")
print("tooluse_fallback_2=openai/gpt-5.6-luna")
print("reasoning_effort=none")
