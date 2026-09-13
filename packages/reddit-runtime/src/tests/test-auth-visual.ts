import { AccountManager } from "../accounts";
import {
  SessionManager,
  ChallengeDetector,
  SessionMonitor
} from "../session";

async function main() {

  const accounts = new AccountManager();

  const session = new SessionManager();

  const detector = new ChallengeDetector();

  const monitor = new SessionMonitor();

  const context =
    await accounts.launch(
      "recruiter-main"
    );

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
  console.log("========== AUTH ==========");
  console.log(
    "Session:",
    await session.state(context)
  );

  console.log(
    "Challenge:",
    await detector.detect(context)
  );

  console.log(
    "Monitor:",
    await monitor.check(
      context,
      "reddit-data/cookies/recruiter-main.json"
    )
  );

  console.log("");
  console.log("Browser will remain open for 30 seconds...");
  console.log("Verify that your Reddit account is logged in.");

  await page.waitForTimeout(30000);

  await context.close();

}

main().catch(console.error);
