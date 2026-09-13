import { AccountManager } from "../accounts";
import { SessionManager } from "../session";

async function main() {

  const accounts =
    new AccountManager();

  const session =
    new SessionManager();

  const context =
    await accounts.launch(
      "recruiter-main"
    );

  const state =
    await session.state(
      context
    );

  console.log(
    "STATE:",
    state
  );

  await context.close();

}

main().catch(console.error);
