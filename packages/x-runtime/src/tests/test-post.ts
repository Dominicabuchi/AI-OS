import { chromium } from "playwright";
import { HumanBrowser } from "@ai-os/browser-runtime";
import { XRuntime } from "../runtime";

async function main() {

  const browser =
    await chromium.launch({
      headless: false
    });

  const page =
    await browser.newPage();

  const human =
    new HumanBrowser(page);

  const x =
    new XRuntime(human);

  console.log("Runtime initialized.");
  console.log("Post test scaffold ready.");

  await browser.close();

}

main().catch(console.error);
