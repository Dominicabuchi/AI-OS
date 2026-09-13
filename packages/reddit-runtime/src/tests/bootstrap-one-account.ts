import { AccountManager } from "../accounts";
import { BootstrapManager } from "../session";

async function main() {

  const id =
    process.argv[2];

  if (!id) {
    throw new Error(
      "Usage: node bootstrap-one-account.js <account-id>"
    );
  }

  const accounts =
    new AccountManager();

  const bootstrap =
    new BootstrapManager();

  const context =
    await accounts.launch(id);

  await bootstrap.bootstrap(
    id,
    context
  );

  await context.close();

}

main().catch(console.error);
