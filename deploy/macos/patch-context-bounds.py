from pathlib import Path

ROOT = Path.home() / "AI-OS"
EXEC = ROOT / "packages/execution-runtime/src/runtime/index.ts"
OPENROUTER = ROOT / "packages/model-runtime/src/providers/openrouter.ts"

exec_text = EXEC.read_text()
router_text = OPENROUTER.read_text()

helper = r'''
const AI_OS_MAX_CONTEXT_ENTRIES = Number(
  process.env.AI_OS_MAX_CONTEXT_ENTRIES ?? 12,
);
const AI_OS_MAX_CONTEXT_ENTRY_CHARS = Number(
  process.env.AI_OS_MAX_CONTEXT_ENTRY_CHARS ?? 6000,
);
const AI_OS_MAX_WORKING_MEMORY_CHARS = Number(
  process.env.AI_OS_MAX_WORKING_MEMORY_CHARS ?? 30000,
);
const AI_OS_MAX_INTELLIGENCE_CHARS = Number(
  process.env.AI_OS_MAX_INTELLIGENCE_CHARS ?? 12000,
);

function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  const head = Math.floor(maxChars * 0.7);
  const tail = maxChars - head;

  return [
    value.slice(0, head),
    `\n...[AI-OS truncated ${value.length - maxChars} chars]...\n`,
    value.slice(-tail),
  ].join("");
}

function compactJson(value: unknown, maxChars: number): string {
  let raw: string;

  try {
    raw = JSON.stringify(value, null, 2);
  } catch {
    raw = String(value);
  }

  return truncateText(raw, maxChars);
}

function serializeContextEntry(value: unknown): string {
  return compactJson(value, AI_OS_MAX_CONTEXT_ENTRY_CHARS);
}

function boundedContext(entries: string[]): string[] {
  const recent = entries.slice(-AI_OS_MAX_CONTEXT_ENTRIES);
  const selected: string[] = [];
  let total = 0;

  for (let i = recent.length - 1; i >= 0; i--) {
    const entry = truncateText(
      recent[i],
      AI_OS_MAX_CONTEXT_ENTRY_CHARS,
    );

    if (
      selected.length > 0 &&
      total + entry.length > AI_OS_MAX_WORKING_MEMORY_CHARS
    ) {
      break;
    }

    selected.push(entry);
    total += entry.length;
  }

  return selected.reverse();
}
'''

marker = "export async function execute("
if "AI_OS_MAX_CONTEXT_ENTRIES" not in exec_text:
    if marker not in exec_text:
        raise SystemExit("execution marker not found")
    exec_text = exec_text.replace(marker, helper + "\n" + marker, 1)

exec_text = exec_text.replace(
    "      JSON.stringify(\n        intelligence,\n        null,\n        2,\n      ),",
    "      compactJson(\n        intelligence,\n        AI_OS_MAX_INTELLIGENCE_CHARS,\n      ),",
)
exec_text = exec_text.replace(
    '      ...context,',
    '      ...boundedContext(context),',
)

old_success = '''        context.push(\n          JSON.stringify({\n            action: action.type,\n            result,\n          }),\n        );'''
new_success = '''        context.push(\n          serializeContextEntry({\n            action: action.type,\n            result,\n          }),\n        );'''
exec_text = exec_text.replace(old_success, new_success)

old_control = '''        context.push(\n          JSON.stringify({\n            action: action.type,\n            result:\n              action.payload ??\n              action.result ??\n              null,\n          }),\n        );'''
new_control = '''        context.push(\n          serializeContextEntry({\n            action: action.type,\n            result:\n              action.payload ??\n              action.result ??\n              null,\n          }),\n        );'''
exec_text = exec_text.replace(old_control, new_control)

old_failure = '''        context.push(\n          JSON.stringify({\n            action: action.type,\n            success: false,\n            error:\n              error instanceof Error\n                ? error.message\n                : String(error),\n            instruction:\n              \"The tool action failed. Inspect this actual failure, correct the cause when appropriate, and continue the mission. Do not fabricate success.\",\n          }),\n        );'''
new_failure = '''        context.push(\n          serializeContextEntry({\n            action: action.type,\n            success: false,\n            error:\n              error instanceof Error\n                ? error.message\n                : String(error),\n            instruction:\n              \"The tool action failed. Inspect this actual failure, correct the cause when appropriate, and continue the mission. Do not fabricate success.\",\n          }),\n        );'''
exec_text = exec_text.replace(old_failure, new_failure)

old_parse = '''      context.push(\n        JSON.stringify({\n          type: \"execution-error\",\n          error:\n            \"The previous model response was not valid executable JSON.\",\n          response:\n            response.text.slice(0, 4000),\n          instruction:\n            \"Retry the mission. Return ONLY executable JSON with an actions array. Do not return prose.\",\n        }),\n      );'''
new_parse = '''      context.push(\n        serializeContextEntry({\n          type: \"execution-error\",\n          error:\n            \"The previous model response was not valid executable JSON.\",\n          response:\n            response.text.slice(0, 4000),\n          instruction:\n            \"Retry the mission. Return ONLY executable JSON with an actions array. Do not return prose.\",\n        }),\n      );'''
exec_text = exec_text.replace(old_parse, new_parse)

router_marker = '''    const controller = new AbortController();\n'''
router_insert = r'''    const maxPromptChars = Number(
      process.env.AI_OS_MAX_PROMPT_CHARS ?? 70000,
    );

    const boundedPrompt =
      request.prompt.length <= maxPromptChars
        ? request.prompt
        : [
            request.prompt.slice(
              0,
              Math.floor(maxPromptChars * 0.65),
            ),
            `\n\n...[AI-OS prompt safety truncation: ${request.prompt.length - maxPromptChars} chars removed]...\n\n`,
            request.prompt.slice(
              -Math.ceil(maxPromptChars * 0.35),
            ),
          ].join("");

'''
if "AI_OS_MAX_PROMPT_CHARS" not in router_text:
    if router_marker not in router_text:
        raise SystemExit("openrouter marker not found")
    router_text = router_text.replace(router_marker, router_insert + router_marker, 1)

router_text = router_text.replace(
    "                content: request.prompt",
    "                content: boundedPrompt",
)

required_exec = [
    "AI_OS_MAX_CONTEXT_ENTRIES",
    "boundedContext(context)",
    "AI_OS_MAX_INTELLIGENCE_CHARS",
    "serializeContextEntry({",
]
for token in required_exec:
    if token not in exec_text:
        raise SystemExit(f"execution patch validation failed: {token}")

required_router = [
    "AI_OS_MAX_PROMPT_CHARS",
    "content: boundedPrompt",
]
for token in required_router:
    if token not in router_text:
        raise SystemExit(f"router patch validation failed: {token}")

EXEC.write_text(exec_text)
OPENROUTER.write_text(router_text)

print("AI_OS_CONTEXT_BOUNDS_PATCH_APPLIED=true")
print("execution_runtime=patched")
print("openrouter_provider=patched")
