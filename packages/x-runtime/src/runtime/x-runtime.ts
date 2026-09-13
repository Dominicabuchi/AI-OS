import { HumanBrowser } from "@ai-os/browser-runtime";

import { XNavigator } from "../navigation";
import { XFeed } from "../feed";
import { XProfiles } from "../profiles";
import { XSearch } from "../search";
import { XMessaging } from "../messaging";
import { XNotifications } from "../notifications";
import { XCommunities } from "../communities";
import { XTrends } from "../trends";
import { XBookmarks } from "../bookmarks";

export class XRuntime {

  readonly navigator: XNavigator;
  readonly feed: XFeed;
  readonly profiles: XProfiles;
  readonly search: XSearch;
  readonly messaging: XMessaging;
  readonly notifications: XNotifications;
  readonly communities: XCommunities;
  readonly trends: XTrends;
  readonly bookmarks: XBookmarks;

  constructor(
    private readonly human: HumanBrowser
  ) {

    this.navigator = new XNavigator(human);
    this.feed = new XFeed(human);
    this.profiles = new XProfiles(human);
    this.search = new XSearch(human);
    this.messaging = new XMessaging(human);
    this.notifications = new XNotifications(human);
    this.communities = new XCommunities(human);
    this.trends = new XTrends(human);
    this.bookmarks = new XBookmarks(human);

  }

}
