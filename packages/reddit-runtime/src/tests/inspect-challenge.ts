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

  await page.waitForTimeout(3000);

  console.log("URL:");
  console.log(page.url());

  console.log("");
  console.log("TITLE:");
  console.log(await page.title());

  console.log("");
  console.log("BODY:");
  console.log(
    (await page.locator("body").innerText()).slice(0, 2000)
  );

  await browser.close();

}

main().catch(console.error);
