import { XClient } from "../client";

async function main() {
  try {
    const me = await XClient.v2.me();
    console.log(JSON.stringify(me.data, null, 2));
  } catch (e: any) {
    console.log("STATUS:", e.code);
    console.log("DATA:", e.data);
  }
}

main();
