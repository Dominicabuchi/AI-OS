import { AccountManager } from "../accounts";

async function main() {

  const manager =
    new AccountManager();

  const context =
    await manager.launch(
      "recruiter-main"
    );

  console.log(
    "Persistent context:",
    !!context
  );

  await context.close();

}

main().catch(console.error);
