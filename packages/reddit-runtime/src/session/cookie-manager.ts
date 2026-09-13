import fs from "fs";
import path from "path";
import { BrowserContext } from "playwright";

export class CookieManager {

  async save(

    context: BrowserContext,

    file: string

  ) {

    fs.mkdirSync(
      path.dirname(file),
      {
        recursive: true
      }
    );

    const cookies =
      await context.cookies();

    fs.writeFileSync(
      file,
      JSON.stringify(
        cookies,
        null,
        2
      )
    );

  }

  async load(

    context: BrowserContext,

    file: string

  ) {

    if (
      !fs.existsSync(file)
    ) {
      return;
    }

    const cookies =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8"
        )
      );

    await context.addCookies(
      cookies
    );

  }

}
