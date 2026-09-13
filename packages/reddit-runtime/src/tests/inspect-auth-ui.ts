import { chromium } from "playwright";

async function main() {

  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto(
    "https://www.reddit.com/",
    {
      waitUntil: "domcontentloaded",
      timeout: 60000
    }
  );

  await page.waitForTimeout(5000);

  console.log("URL:");
  console.log(page.url());

  console.log("");

  console.log("TITLE:");
  console.log(await page.title());

  console.log("");

  const html = await page.content();

  console.log(html.slice(0, 10000));

  await browser.close();

}

main().catch(console.error);
