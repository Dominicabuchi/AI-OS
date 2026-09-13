import { AccountManager } from "../accounts";
import {
  SessionManager,
  AuthState
} from "../session";

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

  console.log("");
  console.log("==============================");
  console.log("Detected State:", state);
  console.log("==============================");

  if (state === AuthState.LOGIN_REQUIRED) {
    console.log("✅ Login required.");
  }

  if (state === AuthState.HUMAN_VERIFICATION) {
    console.log("⚠️ Human verification required.");
  }

  if (state === AuthState.AUTHENTICATED) {
    console.log("✅ Already authenticated.");
  }

  if (state === AuthState.UNKNOWN) {
    console.log("⚠️ Unknown state.");
  }

  await context.close();

}

main().catch(console.error);
