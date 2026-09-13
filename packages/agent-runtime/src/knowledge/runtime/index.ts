import fs from "fs/promises";
import path from "path";

const PACKAGE_ROOT = path.resolve(__dirname, "../../..");
const KNOWLEDGE_ROOT = path.join(PACKAGE_ROOT, "src", "knowledge");

export async function loadKnowledge(
  relativePath: string,
): Promise<string> {
  const file = path.resolve(KNOWLEDGE_ROOT, relativePath);

  if (!file.startsWith(`${KNOWLEDGE_ROOT}${path.sep}`)) {
    throw new Error(`Invalid knowledge path: ${relativePath}`);
  }

  return fs.readFile(file, "utf8");
}
