import { Tool } from "../types/tool";
import { XClient } from "@ai-os/x-runtime";

export class XTool implements Tool {

  readonly id = "x";

  readonly name = "X";

  readonly description =
    "X/Twitter publishing, engagement, search, profiles and account operations.";

  canExecute(action: string): boolean {
    return action.startsWith("x.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    await XClient.auth.ensureAuthenticated();

    switch (action) {

      case "x.post": {
        const text = String(payload.text ?? "");

        if (!text) {
          throw new Error("x.post requires payload.text");
        }

        return await XClient.v2.tweet({
          text
        });
      }

      case "x.reply": {
        const text = String(payload.text ?? "");
        const tweetId = String(payload.tweetId ?? "");

        if (!text || !tweetId) {
          throw new Error(
            "x.reply requires payload.text and payload.tweetId"
          );
        }

        return await XClient.v2.reply(
          text,
          tweetId
        );
      }

      case "x.quote": {
        const text = String(payload.text ?? "");
        const tweetId = String(payload.tweetId ?? "");

        if (!text || !tweetId) {
          throw new Error(
            "x.quote requires payload.text and payload.tweetId"
          );
        }

        return await XClient.v2.quote(
          text,
          tweetId
        );
      }

      case "x.repost": {
        const tweetId = String(payload.tweetId ?? "");
        const userId = String(
          payload.userId ?? process.env.X_USER_ID ?? ""
        );

        if (!tweetId || !userId) {
          throw new Error(
            "x.repost requires payload.tweetId and X_USER_ID"
          );
        }

        return await XClient.v2.retweet(
          userId,
          tweetId
        );
      }

      case "x.like": {
        const tweetId = String(payload.tweetId ?? "");
        const userId = String(
          payload.userId ?? process.env.X_USER_ID ?? ""
        );

        if (!tweetId || !userId) {
          throw new Error(
            "x.like requires payload.tweetId and X_USER_ID"
          );
        }

        return await XClient.v2.like(
          userId,
          tweetId
        );
      }

      case "x.unlike": {
        const tweetId = String(payload.tweetId ?? "");
        const userId = String(
          payload.userId ?? process.env.X_USER_ID ?? ""
        );

        if (!tweetId || !userId) {
          throw new Error(
            "x.unlike requires payload.tweetId and X_USER_ID"
          );
        }

        return await XClient.v2.unlike(
          userId,
          tweetId
        );
      }

      case "x.search": {
        const query = String(payload.query ?? "");

        if (!query) {
          throw new Error("x.search requires payload.query");
        }

        return await XClient.v2.search(
          query,
          {
            max_results: 25,
            expansions: ["author_id"],
            "tweet.fields": [
              "author_id",
              "text",
              "created_at",
              "public_metrics"
            ],
            "user.fields": [
              "username",
              "name"
            ]
          }
        );
      }

      case "x.user": {
        const username = String(payload.username ?? "");

        if (!username) {
          throw new Error("x.user requires payload.username");
        }

        return await XClient.v2.userByUsername(
          username,
          {
            "user.fields": [
              "id",
              "username",
              "name",
              "description",
              "public_metrics"
            ]
          }
        );
      }

      case "x.me": {
        return await XClient.v2.me({
          "user.fields": [
            "id",
            "username",
            "name",
            "description",
            "public_metrics"
          ]
        });
      }

      case "x.timeline": {
        return await XClient.v2.homeTimeline({
          max_results: 20,
          expansions: ["author_id"],
          "tweet.fields": [
            "created_at",
            "public_metrics"
          ],
          "user.fields": [
            "username",
            "name"
          ]
        });
      }

      default:
        throw new Error(
          `Unsupported X action: ${action}`
        );
    }
  }
}
