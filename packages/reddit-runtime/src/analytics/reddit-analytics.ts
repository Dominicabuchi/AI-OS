export class RedditAnalytics {

  posts = 0;
  comments = 0;
  messages = 0;

  recordPost() {
    this.posts++;
  }

  recordComment() {
    this.comments++;
  }

  recordMessage() {
    this.messages++;
  }

}
