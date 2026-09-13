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

  console.log("========== INPUTS ==========");

  const inputs = await page.locator("input").evaluateAll(nodes =>
    nodes.map(n => ({
      type: (n as HTMLInputElement).type,
      name: (n as HTMLInputElement).name,
      id: (n as HTMLInputElement).id,
      placeholder: (n as HTMLInputElement).placeholder
    }))
  );

  console.log(JSON.stringify(inputs, null, 2));

  console.log("");
  console.log("========== BUTTONS ==========");

  const buttons = await page.locator("button").evaluateAll(nodes =>
    nodes.map(n => ({
      text: (n.textContent || "").trim(),
      disabled: (n as HTMLButtonElement).disabled
    }))
  );

  console.log(JSON.stringify(buttons, null, 2));

  await page.waitForTimeout(60000);

  await browser.close();

}

main().catch(console.error);
