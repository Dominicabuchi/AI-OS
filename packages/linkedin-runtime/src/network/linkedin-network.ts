import { HumanBrowser } from "@ai-os/browser-runtime";

import { LinkedInProfile } from "../types/linkedin-profile";

export class LinkedInNetwork {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async invitations(): Promise<LinkedInProfile[]> {
    await this.human.goto("https://www.linkedin.com/mynetwork/invitation-manager/");
    return [];
  }

  async sent(): Promise<LinkedInProfile[]> {
    await this.human.goto("https://www.linkedin.com/mynetwork/invitation-manager/sent/");
    return [];
  }

  async connections(): Promise<LinkedInProfile[]> {
    await this.human.goto("https://www.linkedin.com/mynetwork/");
    return [];
  }

  async connect(profile: string): Promise<void> {

    await this.human.goto(
      profile.startsWith("http")
        ? profile
        : `https://www.linkedin.com/in/${profile}`
    );

    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "profile",
      action: "connect",
      description: "Connect with profile"
    });

  }

  async accept(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "network",
      action: "accept-invitation",
      description: "Accept invitation"
    });
  }

  async ignore(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "network",
      action: "ignore-invitation",
      description: "Ignore invitation"
    });
  }

  async withdraw(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "network",
      action: "withdraw-invitation",
      description: "Withdraw invitation"
    });
  }

  async remove(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "network",
      action: "remove-connection",
      description: "Remove connection"
    });
  }

  async followers(): Promise<LinkedInProfile[]> {
    return [];
  }

  async following(): Promise<LinkedInProfile[]> {
    return [];
  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }

}
