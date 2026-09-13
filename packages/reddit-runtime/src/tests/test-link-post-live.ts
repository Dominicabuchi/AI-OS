import { RedditPosts } from "../posts";

async function main() {

  const posts =
    new RedditPosts();

  const result =
    await posts.create({

      accountId: "recruiter-main",

      subreddit: "testingground4bots",

      title:
        "AI-OS Link Post Test",

      url:
        "https://openai.com"

    });

  console.log("");

  console.log("==============================");

  console.log(result);

  console.log("==============================");

}

main().catch(console.error);
