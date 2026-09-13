export interface PlatformConfig {

  name: string;

  urls: {

    home: string;

    inbox: string;

    notifications?: string;

    profile?: string;

  };

  selectors: {

    searchBox?: string;

    messageInput?: string;

    sendButton?: string;

    conversationList?: string;

    conversationItem?: string;

    unreadBadge?: string;

    messageBubble?: string;

  };

}
