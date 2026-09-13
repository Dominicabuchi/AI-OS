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

  console.log("");
  console.log("================================================");
  console.log("Check the browser manually");
  console.log("================================================");
  console.log("");
  console.log("Is the account actually logged in?");
  console.log("");
  console.log("Leave this browser open.");
  console.log("");

  await page.waitForTimeout(120000);

  await context.close();

}

main().catch(console.error);
