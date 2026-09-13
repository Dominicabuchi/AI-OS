import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    "../../.env"
  )
});

console.log({
  email: process.env.REDDIT_RECRUITER_MAIN_EMAIL,
  passwordLoaded: !!process.env.REDDIT_RECRUITER_MAIN_PASSWORD
});
