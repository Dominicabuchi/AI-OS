import { HumanBrowser } from "@ai-os/browser-runtime";

import { LinkedInJob } from "../types/linkedin-job";

export class LinkedInJobs {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async search(query: string): Promise<LinkedInJob[]> {

    await this.human.goto(
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`
    );

    return [];

  }

  async get(id: string): Promise<LinkedInJob | null> {
    return null;
  }

  async open(url: string): Promise<void> {
    await this.human.goto(url);
  }

  async easyApply(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "jobs",
      action: "easy-apply",
      description: "Click Easy Apply"
    });
  }

  async apply(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "jobs",
      action: "apply",
      description: "Apply to job"
    });
  }

  async save(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "jobs",
      action: "save-job",
      description: "Save job"
    });
  }

  async unsave(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "jobs",
      action: "unsave-job",
      description: "Unsave job"
    });
  }

  async company(): Promise<string> {
    return "";
  }

  async description(): Promise<string> {
    return "";
  }

  async requirements(): Promise<string[]> {
    return [];
  }

  async salary(): Promise<string | null> {
    return null;
  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }

}
