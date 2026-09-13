import { AccountManager } from "../accounts";
import {
  BootstrapManager,
  SessionManager,
  AuthState
} from "../session";

async function main() {

  const accounts =
    new AccountManager();

  const bootstrap =
    new BootstrapManager();

  const session =
    new SessionManager();

  const context =
    await accounts.launch(
      "recruiter-main"
    );

  const current =
    await session.state(context);

  console.log("");
  console.log("==============================");
  console.log("Current Session:", current);
  console.log("==============================");

  if (
    current === AuthState.AUTHENTICATED
  ) {

    console.log("Already authenticated.");

    await bootstrap.cookies.save(
      context,
      "../../reddit-data/cookies/recruiter-main.json"
    );

    await context.close();

    return;

  }

  const page =
    await context.newPage();

  await page.goto(
    "https://www.reddit.com/login",
    {
      waitUntil: "domcontentloaded",
      timeout: 60000
    }
  );

  console.log("");
  console.log("==========================================");
  console.log("LOGIN REQUIRED");
  console.log("==========================================");
  console.log("");
  console.log("1. Log into Reddit.");
  console.log("2. Complete any Reddit challenge.");
  console.log("3. Leave the browser open.");
  console.log("");
  console.log("Waiting for authentication...");

  await bootstrap.bootstrap(
    "recruiter-main",
    context
  );

  console.log("");
  console.log("Authentication complete.");

  await context.close();

}

main().catch(console.error);
