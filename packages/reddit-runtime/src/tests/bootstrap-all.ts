import { AccountBootstrapper } from "../orchestrator";

async function main() {

  const bootstrapper =
    new AccountBootstrapper();

  await bootstrapper.bootstrapAll();

  console.log("");
  console.log("================================");
  console.log("ALL ACCOUNTS BOOTSTRAPPED");
  console.log("================================");

}

main().catch(console.error);
