import { HumanBrowser } from "@ai-os/browser-runtime";

import { LinkedInNavigator } from "../navigation/linkedin-navigator";
import { LinkedInFeed } from "../feed/linkedin-feed";
import { LinkedInProfiles } from "../profiles/linkedin-profiles";
import { LinkedInSearch } from "../search/linkedin-search";
import { LinkedInJobs } from "../jobs/linkedin-jobs";
import { LinkedInNetwork } from "../network/linkedin-network";
import { LinkedInNotifications } from "../notifications/linkedin-notifications";
import { LinkedInMessaging } from "../messaging/linkedin-messaging";

export class LinkedInRuntime {

  readonly navigator: LinkedInNavigator;
  readonly feed: LinkedInFeed;
  readonly profiles: LinkedInProfiles;
  readonly search: LinkedInSearch;
  readonly jobs: LinkedInJobs;
  readonly network: LinkedInNetwork;
  readonly notifications: LinkedInNotifications;
  readonly messaging: LinkedInMessaging;

  constructor(
    private readonly human: HumanBrowser
  ) {

    this.navigator = new LinkedInNavigator(human);
    this.feed = new LinkedInFeed(human);
    this.profiles = new LinkedInProfiles(human);
    this.search = new LinkedInSearch(human);
    this.jobs = new LinkedInJobs(human);
    this.network = new LinkedInNetwork(human);
    this.notifications = new LinkedInNotifications(human);
    this.messaging = new LinkedInMessaging(human);

  }

}
