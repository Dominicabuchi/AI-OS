import { AccountManager } from "../accounts";

async function main() {

  const accounts = new AccountManager();

  const context =
    await accounts.launch("recruiter-main");

  const page =
    await context.newPage();

  await page.goto(
    "https://www.reddit.com/",
    {
      waitUntil: "domcontentloaded",
      timeout: 60000
    }
  );

  await page.waitForTimeout(2000);

  console.log("================================");
  console.log("URL");
  console.log("================================");
  console.log(page.url());

  console.log("");

  console.log("================================");
  console.log("TITLE");
  console.log("================================");
  console.log(await page.title());

  console.log("");

  console.log("================================");
  console.log("BODY (first 1000 chars)");
  console.log("================================");
  console.log(
    (await page.locator("body").innerText()).slice(0, 1000)
  );

  console.log("");

  console.log("================================");
  console.log("COOKIES");
  console.log("================================");

  const cookies = await context.cookies();

  console.log(
    cookies.map(c => ({
      name: c.name,
      domain: c.domain
    }))
  );

  await context.close();

}

main().catch(console.error);
