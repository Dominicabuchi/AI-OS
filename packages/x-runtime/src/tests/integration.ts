import { chromium } from "playwright";

import { HumanBrowser } from "@ai-os/browser-runtime";
import { XRuntime } from "../runtime";
import { SalesEngine } from "../sales";

async function main() {

  const browser =
    await chromium.launch({
      headless: false,
    });

  const page =
    await browser.newPage();

  const human =
    new HumanBrowser(page);

  const x =
    new XRuntime(human);

  const sales =
    new SalesEngine(human);

  console.log("✅ Runtime created");
  console.log("Navigator:", !!x.navigator);
  console.log("Feed:", !!x.feed);
  console.log("Profiles:", !!x.profiles);
  console.log("Search:", !!x.search);
  console.log("Messaging:", !!x.messaging);
  console.log("Notifications:", !!x.notifications);
  console.log("Communities:", !!x.communities);
  console.log("Trends:", !!x.trends);
  console.log("Bookmarks:", !!x.bookmarks);
  console.log("Sales:", !!sales);

  await browser.close();

}

main().catch(console.error);
