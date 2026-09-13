import { PlatformConfig } from "../../core/platform";

export const XConfig: PlatformConfig = {

  name: "x",

  urls: {

    home: "https://x.com/home",

    inbox: "https://x.com/messages",

    notifications:
      "https://x.com/notifications",

    profile:
      "https://x.com/"

  },

  selectors: {

    searchBox:
      "input[data-testid='SearchBox_Search_Input'], input[aria-label='Search query']",

    messageInput:
      "div[data-testid='dmComposerTextInput'], div[contenteditable='true']",

    sendButton:
      "button[data-testid='dmComposerSendButton']",

    conversationList:
      "[data-testid='DmScroller']",

    conversationItem:
      "[data-testid='cellInnerDiv']",

    unreadBadge:
      "[aria-label*='Unread']",

    messageBubble:
      "[data-testid='messageEntry']"

  }

};

export { XSelectors } from "./selectors";
