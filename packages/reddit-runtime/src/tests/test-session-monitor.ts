import { AccountManager } from "../accounts";
import { SessionMonitor } from "../session";

async function main() {

  const accounts = new AccountManager();
  const monitor = new SessionMonitor();

  const context =
    await accounts.launch("recruiter-main");

  const state =
    await monitor.check(
      context,
      "reddit-data/cookies/recruiter-main.json"
    );

  console.log("Session State:", state);

  await context.close();

}

main().catch(console.error);
