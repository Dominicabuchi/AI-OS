import { PlatformConfig } from "../../core/platform";

export const LinkedInConfig: PlatformConfig = {

  name: "linkedin",

  urls: {

    home: "https://www.linkedin.com/feed/",

    inbox: "https://www.linkedin.com/messaging/",

    notifications:
      "https://www.linkedin.com/notifications/",

    profile:
      "https://www.linkedin.com/in/"

  },

  selectors: {

    searchBox:
      "input[placeholder='Search'], input[aria-label='Search']",

    messageInput:
      "div[contenteditable='true']",

    sendButton:
      "button[type='submit']",

    conversationList:
      "ul.msg-conversations-container__conversations-list",

    conversationItem:
      "li.msg-conversation-listitem",

    unreadBadge:
      ".msg-conversation-card__unread-count",

    messageBubble:
      ".msg-s-message-list__event"

  }

};


export { LinkedInSelectors } from "./selectors";
