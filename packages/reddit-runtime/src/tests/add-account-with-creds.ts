import fs from "fs";
import path from "path";

import { AccountStore, AccountManager } from "../accounts";
import { BootstrapManager } from "../session";

async function main() {

  const [
    id,
    role,
    email,
    password
  ] = process.argv.slice(2);

  if (!id || !role || !email || !password) {
    throw new Error(
      "Usage: node add-account-with-creds.js <id> <role> <email> <password>"
    );
  }

  const store =
    new AccountStore();

  if (!store.get(id)) {

    store.add({

      id,

      username: id,

      email,

      role: role as any,

      enabled: true,

      initialized: false,

      authenticated: false,

      profilePath: `profiles/${id}`,

      sessionPath: `sessions/${id}`,

      cookiesPath: `cookies/${id}.json`,

      storagePath: `storage/${id}.json`,

      createdAt: Date.now()

    });

    console.log("✅ Account created.");

  } else {

    console.log("ℹ️ Account already exists.");

  }

  const envFile =
    path.resolve(
      process.cwd(),
      "../../.env"
    );

  let env =
    fs.existsSync(envFile)
      ? fs.readFileSync(envFile, "utf8")
      : "";

  const prefix =
    id.replace(/-/g, "_").toUpperCase();

  const vars = {

    [`REDDIT_${prefix}_EMAIL`]:
      email,

    [`REDDIT_${prefix}_PASSWORD`]:
      password

  };

  for (const [key, value] of Object.entries(vars)) {

    const line = `${key}=${value}`;

    const regex =
      new RegExp(
        `^${key}=.*$`,
        "m"
      );

    if (regex.test(env)) {

      env =
        env.replace(regex, line);

    } else {

      if (
        env.length &&
        !env.endsWith("\n")
      ) {
        env += "\n";
      }

      env += line + "\n";

    }

  }

  fs.writeFileSync(
    envFile,
    env
  );

  process.env[
    `REDDIT_${prefix}_EMAIL`
  ] = email;

  process.env[
    `REDDIT_${prefix}_PASSWORD`
  ] = password;

  console.log("✅ Credentials saved.");

  const manager =
    new AccountManager();

  const bootstrap =
    new BootstrapManager();

  const context =
    await manager.launch(id);

  await bootstrap.bootstrap(
    id,
    context
  );

  await context.close();

  console.log("");
  console.log("==================================");
  console.log("ONBOARDING COMPLETE");
  console.log("==================================");

}

main().catch(console.error);
