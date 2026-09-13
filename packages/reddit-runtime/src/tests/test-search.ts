import { chromium } from "playwright";
import { HumanBrowser } from "@ai-os/browser-runtime";
import { RedditRuntime } from "../runtime";

async function main() {

  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  const human = new HumanBrowser(page);

  const reddit = new RedditRuntime(human);

  await reddit.search.search("recruiting software");

  console.log("✅ Search");

  await reddit.search.communities("recruiting");

  console.log("✅ Communities");

  await reddit.search.people("recruiter");

  console.log("✅ People");

  await browser.close();

}

main().catch(console.error);
