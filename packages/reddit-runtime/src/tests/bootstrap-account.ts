import { AccountManager } from "../accounts";
import { SessionManager, AuthState, AuthFinalizer } from "../session";

async function main() {

  const manager =
    new AccountManager();

  const session =
    new SessionManager();

  const finalizer =
    new AuthFinalizer();

  const context =
    await manager.browser.launch(
      manager.profiles.path(
        "recruiter-main"
      )
    );

  const page = context.pages()[0] ??
    await context.newPage();

  await page.goto(
    "https://www.reddit.com/login/",
    {
      waitUntil: "domcontentloaded",
      timeout: 60000
    }
  );

  console.log("");
  console.log("========================================");
  console.log("BOOTSTRAP recruiter-main");
  console.log("========================================");
  console.log("");
  console.log("1. Log into Reddit manually.");
  console.log("2. Complete any Reddit verification.");
  console.log("3. Leave the browser open.");
  console.log("");
  console.log("Waiting for authentication...");
  console.log("");

  while (true) {

    const state =
      await session.stateFromPage(page);

    process.stdout.write(
      "\rState: " + state + "                "
    );

    if (
      state === AuthState.AUTHENTICATED
    ) {

      console.log("");
      console.log("");
      console.log("✅ Authenticated.");

      finalizer.finalize(
        "recruiter-main"
      );

      break;

    }

    await page.waitForTimeout(
      2000
    );

  }

  console.log("");
  console.log("Persistent profile saved.");
  console.log("Close this browser only after you see this message.");

  await page.waitForTimeout(
    10000
  );

  await context.close();

}
main().catch(console.error);
