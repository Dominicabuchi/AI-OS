import { chromium } from "playwright";
import { HumanBrowser } from "@ai-os/browser-runtime";
import { RedditRuntime } from "../runtime";

async function main() {

  const browser =
    await chromium.launch({
      headless: false
    });

  const page =
    await browser.newPage();

  const human =
    new HumanBrowser(page);

  const reddit =
    new RedditRuntime(human);

  await reddit.navigation.home();

  console.log("✅ Home");

  await reddit.navigation.subreddit("programming");

  console.log("✅ Subreddit");

  await reddit.navigation.notifications();

  console.log("✅ Notifications");

  await browser.close();

}

main().catch(console.error);
