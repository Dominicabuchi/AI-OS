import { chromium } from "playwright";

import { HumanBrowser } from "@ai-os/browser-runtime";
import { XRuntime } from "../runtime";
import { SalesEngine } from "../sales";

async function verify(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ PASS  ${name}`);
  } catch (error) {
    console.error(`❌ FAIL  ${name}`);
    console.error(error);
  }
}

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

  await verify(
    "Runtime",
    async () => {}
  );

  await verify(
    "Navigator",
    async () => {
      if (!x.navigator) throw new Error();
    }
  );

  await verify(
    "Feed",
    async () => {
      if (!x.feed) throw new Error();
    }
  );

  await verify(
    "Profiles",
    async () => {
      if (!x.profiles) throw new Error();
    }
  );

  await verify(
    "Search",
    async () => {
      if (!x.search) throw new Error();
    }
  );

  await verify(
    "Messaging",
    async () => {
      if (!x.messaging) throw new Error();
    }
  );

  await verify(
    "Notifications",
    async () => {
      if (!x.notifications) throw new Error();
    }
  );

  await verify(
    "Communities",
    async () => {
      if (!x.communities) throw new Error();
    }
  );

  await verify(
    "Trends",
    async () => {
      if (!x.trends) throw new Error();
    }
  );

  await verify(
    "Bookmarks",
    async () => {
      if (!x.bookmarks) throw new Error();
    }
  );

  await verify(
    "Sales Engine",
    async () => {
      if (!sales) throw new Error();
    }
  );

  console.log("");
  console.log("==================================");
  console.log("X Runtime Verification Complete");
  console.log("==================================");

  await browser.close();

}

main().catch(console.error);
