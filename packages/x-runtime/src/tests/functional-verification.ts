import { chromium } from "playwright";
import { HumanBrowser } from "@ai-os/browser-runtime";
import { XRuntime } from "../runtime";

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ PASS ${name}`);
  } catch (e) {
    console.error(`❌ FAIL ${name}`);
    console.error(e);
  }
}

async function main() {

  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  const human = new HumanBrowser(page);

  const x = new XRuntime(human);

  //
  // IMPORTANT:
  // Replace YOUR_X_HOME_URL with the URL your navigator
  // normally uses after login if it differs.
  //
  await human.goto("https://x.com/home");

  await check("Feed.home()", async () => {
    await x.feed.home();
  });

  await check("Feed.getPosts()", async () => {
    await x.feed.getPosts();
  });

  await check("Search.search()", async () => {
    await x.search.search("OpenAI");
  });

  await check("Search.top()", async () => {
    await x.search.top("OpenAI");
  });

  await check("Profiles.me()", async () => {
    await x.profiles.me();
  });

  await check("Profiles.get()", async () => {
    await x.profiles.get();
  });

  await check("Messaging.open()", async () => {
    await x.messaging.open();
  });

  await check("Messaging.list()", async () => {
    await x.messaging.list();
  });

  await check("Notifications.open()", async () => {
    await x.notifications.open();
  });

  await check("Notifications.list()", async () => {
    await x.notifications.list();
  });

  await check("Communities.open()", async () => {
    await x.communities.open();
  });

  await check("Trends.open()", async () => {
    await x.trends.open();
  });

  await check("Trends.list()", async () => {
    await x.trends.list();
  });

  await check("Bookmarks.open()", async () => {
    await x.bookmarks.open();
  });

  await check("Bookmarks.list()", async () => {
    await x.bookmarks.list();
  });

  console.log("");
  console.log("================================");
  console.log("FUNCTIONAL VERIFICATION COMPLETE");
  console.log("================================");

  await browser.close();
}

main().catch(console.error);
