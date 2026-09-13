import { XClient } from "../client";

async function main() {
  try {
    const me = await XClient.v2.me({
      "user.fields": [
        "id",
        "name",
        "username"
      ]
    });

    console.log("");
    console.log("================================");
    console.log("OAuth2 Authentication Success");
    console.log("================================");
    console.log(me.data);

  } catch (e: any) {

    console.error("");
    console.error("================================");
    console.error("OAuth2 Authentication Failed");
    console.error("================================");
    console.error("STATUS:", e.code);
    console.error("DATA:", e.data);

    process.exit(1);
  }
}

main();
