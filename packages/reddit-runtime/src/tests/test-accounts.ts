import { AccountStore } from "../accounts";

const store = new AccountStore();

console.log("Accounts:");
console.log(store.all());
