import { AccountManager } from "../accounts";

async function main() {

  const manager =
    new AccountManager();

  console.log("");
  console.log("========================================");
  console.log("Launching recruiter-main");
  console.log("========================================");
  console.log("");

  const context =
    await manager.launch(
      "recruiter-main"
    );

  console.log("");
  console.log("========================================");
  console.log("Browser launched.");
  console.log("Watch the browser.");
  console.log("");
  console.log("Expected:");
  console.log("  ✓ Open Reddit");
  console.log("  ✓ Go to Login");
  console.log("  ✓ Fill Email");
  console.log("  ✓ Fill Password");
  console.log("  ✓ Click Log In");
  console.log("");
  console.log("If Reddit asks for");
  console.log("\"Prove your humanity\",");
  console.log("complete it manually.");
  console.log("");
  console.log("The runtime should");
  console.log("continue automatically.");
  console.log("========================================");
  console.log("");

  await context.pages()[0].waitForTimeout(
    180000
  );

  await context.close();

}

main().catch(console.error);
