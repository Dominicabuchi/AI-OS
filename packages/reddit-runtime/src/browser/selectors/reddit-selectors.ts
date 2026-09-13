export const RedditSelectors = {

  createPostButton: [
    'a[href*="/submit"]',
    'button:has-text("Create Post")',
    'button:has-text("Create post")'
  ],

  titleInput: [
    'textarea[placeholder*="Title"]',
    'textarea[name="title"]'
  ],

  bodyInput: [
    'div[contenteditable="true"]',
    'textarea'
  ],

  postButton: [
    'button:has-text("Post")'
  ],

  commentInput: [
    'div[contenteditable="true"]',
    'textarea'
  ],

  commentButton: [
    'button:has-text("Comment")'
  ],

  searchInput: [
    'input[type="search"]'
  ]

};
