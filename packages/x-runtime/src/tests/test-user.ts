import { XClient } from "../client";

async function main() {
  const user = await XClient.v2.userByUsername("evex_ai");

  console.log(JSON.stringify(user.data, null, 2));
}

main().catch(console.error);
