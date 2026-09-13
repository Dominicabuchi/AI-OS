import { XClient } from "../client";

async function main() {
  const me = await XClient.v2.me({
    "user.fields": ["id", "username", "name"]
  });

  console.log(JSON.stringify(me.data, null, 2));
}

main().catch(console.error);
