import { chromium } from "playwright";
import { HumanBrowser } from "@ai-os/browser-runtime";
import { RedditRuntime } from "../runtime";

async function main() {

  const browser =
    await chromium.launch({
      headless:false
    });

  const page =
    await browser.newPage();

  const human =
    new HumanBrowser(page);

  const reddit =
    new RedditRuntime(human);

  await reddit.subreddits.open("programming");

  console.log("✅ Opened subreddit");

  // Join/Leave remain commented until you're logged in.
  // await reddit.subreddits.join();
  // await reddit.subreddits.leave();

  await browser.close();

}

main().catch(console.error);
