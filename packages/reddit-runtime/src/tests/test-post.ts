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

  await reddit.posts.create({

    subreddit:"test",

    title:"AI OS Browser Runtime Test",

    body:"Testing the Reddit runtime draft system."

  });

  console.log("✅ Draft workflow complete");

  await browser.close();

}

main().catch(console.error);
