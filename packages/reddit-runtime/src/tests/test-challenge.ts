import { AccountManager } from "../accounts";
import {
  ChallengeDetector
} from "../session";

async function main(){

  const accounts=
    new AccountManager();

  const detector=
    new ChallengeDetector();

  const context=
    await accounts.launch(
      "recruiter-main"
    );

  const state=
    await detector.detect(
      context
    );

  console.log(
    "Challenge:",
    state
  );

  await context.close();

}

main().catch(console.error);
