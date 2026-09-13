import { AccountOrchestrator } from "../orchestrator";

async function main() {

  const orchestrator =
    new AccountOrchestrator();

  await orchestrator.start();

  console.log("");

  console.log("Pool Size:");

  console.log(
    orchestrator.pool.all().size
  );

  await orchestrator.health();

  await orchestrator.stop();

}

main().catch(console.error);
