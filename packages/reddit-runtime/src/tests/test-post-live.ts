import { RedditPosts } from "../posts";

async function main() {

  const posts =
    new RedditPosts();

  const result =
    await posts.create({

      accountId: "recruiter-main",

      subreddit: "testingground4bots",

      title:
        "AI-OS Live Posting Test",

      body:
        "This post was created by the AI-OS Reddit Runtime."

    });

  console.log("");
  console.log("==============================");
  console.log(result);
  console.log("==============================");

}

main().catch(console.error);
