import { AccountStore } from "../accounts";

async function main() {

  const [
    id,
    username,
    role
  ] = process.argv.slice(2);

  if (!id || !username || !role) {
    throw new Error(
      "Usage: node add-account.js <id> <username> <role>"
    );
  }

  const store =
    new AccountStore();

  if (store.get(id)) {
    console.log("Account already exists.");
    return;
  }

  store.add({

    id,

    username,

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

  console.log("✅ Added:", id);

}

main().catch(console.error);
