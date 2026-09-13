import { AccountManager } from "../accounts";
import {
  SessionRecovery
} from "../session";

async function main() {

  const accounts =
    new AccountManager();

  const recovery =
    new SessionRecovery();

  const context =
    await accounts.launch(
      "recruiter-main"
    );

  const ok =
    await recovery.recover(
      context,
      "reddit-data/cookies/recruiter-main.json"
    );

  console.log(
    "Recovered:",
    ok
  );

  await context.close();

}

main().catch(console.error);
