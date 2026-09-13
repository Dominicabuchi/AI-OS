import { Tool } from "../types/tool";
import { promises as fs } from "fs";

export class FilesTool implements Tool {

  readonly id = "files";

  readonly name = "Files";

  readonly description = "Read and write files";

  canExecute(action: string): boolean {
    return action.startsWith("files.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    const path = String(payload.path);

    switch (action) {

      case "files.read":
        return await fs.readFile(path, "utf8");

      case "files.write":
        await fs.writeFile(
          path,
          String(payload.content)
        );
        return true;

      case "files.append":
        await fs.appendFile(
          path,
          String(payload.content)
        );
        return true;

      case "files.delete":
        await fs.unlink(path);
        return true;

      case "files.exists":

        try {

          await fs.access(path);

          return true;

        } catch {

          return false;

        }

      default:

        throw new Error(
          `Unsupported files action: ${action}`
        );

    }

  }

}
