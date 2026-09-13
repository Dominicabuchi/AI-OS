import { chromium } from "playwright";

async function main() {

  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.reddit.com/login/",
    {
      waitUntil: "domcontentloaded"
    }
  );

  console.log("TITLE:", await page.title());

  const buttons = await page.locator("button").allTextContents();

  console.log("");
  console.log("========== BUTTONS ==========");
  console.log(buttons);

  await browser.close();

}

main().catch(console.error);
