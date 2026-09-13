import { AccountStore, AccountManager } from "../accounts";

async function main() {

  const store =
    new AccountStore();

  const manager =
    new AccountManager();

  const accounts =
    store.all();

  console.log("");
  console.log("======================================");
  console.log("VERIFYING ALL REDDIT ACCOUNTS");
  console.log("======================================");
  console.log("");

  for (const account of accounts) {

    console.log("--------------------------------------");
    console.log("Account:", account.id);
    console.log("--------------------------------------");

    const context =
      await manager.launch(account.id);

    const page =
      context.pages()[0] ??
      await context.newPage();

    await page.goto(
      "https://www.reddit.com/",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );

    console.log("✅ Reddit loaded.");
    console.log("👀 Visually verify this account.");
    console.log("⏳ Waiting 30 seconds...");

    await page.waitForTimeout(
      30000
    );

    await context.close();

    console.log("✅ Closed:", account.id);
    console.log("");

  }

  console.log("======================================");
  console.log("ALL ACCOUNTS VERIFIED");
  console.log("======================================");

}

main().catch(console.error);
