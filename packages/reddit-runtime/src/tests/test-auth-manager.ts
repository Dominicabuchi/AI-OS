import { AccountManager } from "../accounts";
import { AuthManager } from "../session";

async function main() {

  const accounts =
    new AccountManager();

  const auth =
    new AuthManager();

  const context =
    await accounts.launch(
      "recruiter-main"
    );

  const ok =
    await auth.authenticate(
      context,
      {
        username: process.env.REDDIT_TEST_USERNAME ?? "",
        password: process.env.REDDIT_TEST_PASSWORD ?? ""
      }
    );

  console.log(
    "Authenticated:",
    ok
  );

  await context.close();

}

main().catch(console.error);
