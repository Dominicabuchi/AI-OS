import { AccountManager } from "../accounts";
import { CookieManager } from "../session";

async function main() {

  const accounts =
    new AccountManager();

  const cookies =
    new CookieManager();

  const context =
    await accounts.launch(
      "recruiter-main"
    );

  await cookies.save(
    context,
    "reddit-data/cookies/recruiter-main.json"
  );

  console.log("Cookies saved.");

  await context.close();

}

main().catch(console.error);
