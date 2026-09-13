import { CredentialProvider } from "../secrets";

const provider =
  new CredentialProvider();

console.log(
  provider.get(
    "recruiter-03"
  )
);
