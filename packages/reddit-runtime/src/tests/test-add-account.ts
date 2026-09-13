import { AccountStore } from "../accounts";

const store = new AccountStore();

store.add({

  id: "recruiter-main",

  username: "recruiter-main",

  role: "recruiter",

  enabled: true,

  initialized: false,

  authenticated: false,

  profilePath: "profiles/recruiter-main",

  sessionPath: "sessions/recruiter-main",

  cookiesPath: "cookies/recruiter-main.json",

  storagePath: "storage/recruiter-main.json",

  createdAt: Date.now()

});

console.log(store.all());
