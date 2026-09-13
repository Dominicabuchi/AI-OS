import { BrowserManager } from "@ai-os/browser-runtime";
import { LinkedInChannel } from "../src/channels/linkedin";
import * as fs from "fs";

async function main() {

  const browser = new BrowserManager();

  await browser.start();

  const page = browser.getPage();

  const linkedin = new LinkedInChannel(browser);

  await linkedin.inbox();

  await page.waitForTimeout(5000);

  fs.writeFileSync(
    "linkedin-messaging.html",
    await page.content()
  );

  console.log("HTML saved to linkedin-messaging.html");

  await page.waitForTimeout(60000);

  await browser.close();

}

main().catch(console.error);
