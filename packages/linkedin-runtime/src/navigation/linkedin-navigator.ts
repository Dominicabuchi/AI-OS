import { HumanBrowser } from "@ai-os/browser-runtime";

export class LinkedInNavigator {

  constructor(
    private readonly human: HumanBrowser
  ) {}

  private async goto(url: string): Promise<void> {
    await this.human.goto(url);
  }

  async open(url: string): Promise<void> {
    await this.goto(url);
  }

  async home(): Promise<void> {
    await this.goto("https://www.linkedin.com/");
  }

  async feed(): Promise<void> {
    await this.goto("https://www.linkedin.com/feed/");
  }

  async messages(): Promise<void> {
    await this.goto("https://www.linkedin.com/messaging/");
  }

  async notifications(): Promise<void> {
    await this.goto("https://www.linkedin.com/notifications/");
  }

  async network(): Promise<void> {
    await this.goto("https://www.linkedin.com/mynetwork/");
  }

  async jobs(): Promise<void> {
    await this.goto("https://www.linkedin.com/jobs/");
  }

  async savedJobs(): Promise<void> {
    await this.goto("https://www.linkedin.com/my-items/saved-jobs/");
  }

  async myItems(): Promise<void> {
    await this.goto("https://www.linkedin.com/my-items/");
  }

  async groups(): Promise<void> {
    await this.goto("https://www.linkedin.com/groups/");
  }

  async events(): Promise<void> {
    await this.goto("https://www.linkedin.com/events/");
  }

  async myProfile(): Promise<void> {
    await this.goto("https://www.linkedin.com/in/");
  }

  async profile(url: string): Promise<void> {

    if (url.startsWith("http")) {
      await this.goto(url);
      return;
    }

    if (url.startsWith("/")) {
      await this.goto(`https://www.linkedin.com${url}`);
      return;
    }

    await this.goto(`https://www.linkedin.com/in/${url}`);
  }

  async company(url: string): Promise<void> {

    if (url.startsWith("http")) {
      await this.goto(url);
      return;
    }

    if (url.startsWith("/")) {
      await this.goto(`https://www.linkedin.com${url}`);
      return;
    }

    await this.goto(`https://www.linkedin.com/company/${url}`);
  }

  async search(query: string): Promise<void> {
    await this.goto(
      `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`
    );
  }

  async people(query: string): Promise<void> {
    await this.goto(
      `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`
    );
  }

  async companies(query: string): Promise<void> {
    await this.goto(
      `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(query)}`
    );
  }

  async posts(query: string): Promise<void> {
    await this.goto(
      `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(query)}`
    );
  }

}
