import { HumanBrowser } from "@ai-os/browser-runtime";

import {
  RedditBrowser,
  RedditActions
} from "../browser";

import {
  SessionManager,
  ProfileManager
} from "../session";

import { RedditNavigation } from "../navigation";
import { RedditFeed } from "../feed";
import { RedditSearch } from "../search";
import { RedditSubreddits } from "../subreddits";
import { RedditPosts } from "../posts";
import { RedditComments } from "../comments";
import { RedditUsers } from "../users";
import { RedditMessages } from "../messages";
import { RedditNotifications } from "../notifications";

import { AccountStore } from "../accounts";
import { ProfileStore } from "../storage";

import { RedditScheduler } from "../scheduler";
import { RedditQueue } from "../queue";
import { RedditAnalytics } from "../analytics";

import { CapabilityRouter } from "../providers/CapabilityRouter";
import { RedditMCP } from "../mcp";
import { PostService as MCPPostService } from "../mcp/services/PostService";


export class RedditRuntime {

  readonly browser: RedditBrowser;
  readonly actions: RedditActions;
  readonly browserProfiles = new ProfileManager();

  readonly navigation: RedditNavigation;
  readonly feed: RedditFeed;
  readonly search: RedditSearch;
  readonly subreddits: RedditSubreddits;

  readonly posts: RedditPosts;
  readonly comments: RedditComments;
  readonly users: RedditUsers;
  readonly messages: RedditMessages;
  readonly notifications: RedditNotifications;

  readonly accounts = new AccountStore();
  readonly session = new SessionManager();
  readonly profiles = new ProfileStore();

  readonly scheduler = new RedditScheduler();
  readonly queue = new RedditQueue();
  readonly analytics = new RedditAnalytics();

  readonly router =
    new CapabilityRouter();

  readonly mcp =
    new RedditMCP();

  readonly mcpPosts =
    new MCPPostService(
      this.mcp
    );




  constructor(human: HumanBrowser) {

    this.browser = new RedditBrowser(human);
    this.actions = new RedditActions(human);

    this.navigation = new RedditNavigation(this.browser);
    this.feed = new RedditFeed(human);
    this.search = new RedditSearch(human);
    this.subreddits = new RedditSubreddits(human);

    this.posts = new RedditPosts(human);
    this.comments = new RedditComments(human);
    this.users = new RedditUsers(human);
    this.messages = new RedditMessages(human);
    this.notifications = new RedditNotifications(human);

  }


  async createPost(
    post: any
  ) {

    if (
      this.router.backend(
        "createPost"
      ).toString() === "MCP"
    ) {

      try {

        return await this.mcpPosts.create(
          post
        );

      } catch (error) {

        console.warn(
          "MCP createPost failed. Falling back to browser."
        );

      }

    }

    return this.posts.publish(
      post
    );

  }



}
