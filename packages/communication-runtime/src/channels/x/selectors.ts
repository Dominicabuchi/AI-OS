export const XSelectors = {

  searchInput:
    "input[data-testid='SearchBox_Search_Input'], input[aria-label='Search query']",

  conversations:
    "[data-testid='cellInnerDiv']",

  messages:
    "[data-testid='messageEntry']",

  composer:
    "div[data-testid='dmComposerTextInput'], div[contenteditable='true']",

  sendButton:
    "button[data-testid='dmComposerSendButton']",

  unread:
    "[aria-label*='Unread']",

  profileName:
    "[data-testid='UserName']",

  followButton:
    "[data-testid$='follow']"

};
