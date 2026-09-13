import { AccountManager } from "../accounts";
import { AuthManager } from "../session";

async function main() {

  const accounts =
    new AccountManager();

  const auth =
    new AuthManager();

  const context =
    await accounts.launch("recruiter-main");

  const state =
    await auth.authenticate(
      context,
      {
        username: "",
        password: ""
      }
    );

  console.log("STATE:", state);

  await context.close();

}

main().catch(console.error);
