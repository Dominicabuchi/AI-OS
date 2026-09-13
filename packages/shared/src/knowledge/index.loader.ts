import fs from "fs/promises";
import path from "path";

const KNOWLEDGE_ROOT = path.resolve(
  __dirname,
  "../../../agent-runtime/src/knowledge"
);

export async function loadKnowledge(
  relativePath: string
): Promise<string> {
  return fs.readFile(
    path.join(KNOWLEDGE_ROOT, relativePath),
    "utf8"
  );
}

export async function loadKnowledgeDirectory(
  directory: string
): Promise<Record<string, string>> {
  const dir = path.join(KNOWLEDGE_ROOT, directory);
  const files = await fs.readdir(dir);

  const result: Record<string, string> = {};

  for (const file of files) {
    result[file] = await loadKnowledge(
      path.join(directory, file)
    );
  }

  return result;
}
