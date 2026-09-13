import { AccountManager } from "../accounts";

async function main() {

  const manager =
    new AccountManager();

  const context =
    await manager.launch("recruiter-main");

  const page =
    context.pages()[0] ??
    await context.newPage();

  await page.goto(
    "https://www.reddit.com/r/testingground4bots/submit",
    {
      waitUntil: "domcontentloaded"
    }
  );

  console.log("Opening submit page...");

  const linkTab =
    page.getByText(/link/i).first();

  if (await linkTab.isVisible().catch(() => false)) {
    await linkTab.click();
  }

  await page.waitForTimeout(2000);

  console.log("");
  console.log("========== INPUTS ==========");

  const inputs =
    await page.locator("input, textarea").evaluateAll(nodes =>
      nodes.map(n => ({
        tag: n.tagName,
        type: (n as HTMLInputElement).type,
        name: (n as HTMLInputElement).name,
        placeholder: (n as HTMLInputElement).placeholder,
        aria: n.getAttribute("aria-label")
      }))
    );

  console.log(JSON.stringify(inputs, null, 2));

  console.log("");
  console.log("========== CONTENTEDITABLE ==========");

  const editors =
    await page.locator('[contenteditable="true"]').count();

  console.log(editors);

  await page.waitForTimeout(30000);

  await context.close();

}

main().catch(console.error);
