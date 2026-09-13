import { HumanBrowser } from "@ai-os/browser-runtime";

import { LinkedInProfile } from "../types/linkedin-profile";
import { LinkedInPost } from "../types/linkedin-post";
import { LinkedInExperience } from "../types/linkedin-experience";
import { LinkedInEducation } from "../types/linkedin-education";
import { LinkedInContact } from "../types/linkedin-contact";

export class LinkedInProfiles {

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(profile: string): Promise<void> {
    await this.human.goto(profile.startsWith("http")
      ? profile
      : `https://www.linkedin.com/in/${profile}`);
  }

  async me(): Promise<LinkedInProfile> {
    return this.current();
  }

  async current(): Promise<LinkedInProfile> {
    return this.get();
  }

  async get(profile?: string): Promise<LinkedInProfile> {

    if (profile)
      await this.open(profile);

    return await this.human.evaluate(() => {

      return {

        id: location.pathname,

        profileUrl: location.href,

        name:
          document.querySelector("h1")?.textContent?.trim() || "",

        headline:
          document.querySelector(".text-body-medium")?.textContent?.trim(),

        location:
          document.querySelector(".text-body-small")?.textContent?.trim(),

        about: "",

        avatar:
          document.querySelector("img")?.getAttribute("src") || "",

        banner: "",

        followers: 0,

        connections: 0,

        skills: [],

        experience: [],

        education: [],

        contact: {},

        posts: []

      };

    });

  }

  async follow(profile: string): Promise<void> {
    await this.open(profile);
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "profile",
      action: "follow",
      description: "Follow profile"
    });
  }

  async unfollow(profile: string): Promise<void> {
    await this.open(profile);
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "profile",
      action: "unfollow",
      description: "Unfollow profile"
    });
  }

  async connect(profile: string): Promise<void> {
    await this.open(profile);
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "profile",
      action: "connect",
      description: "Connect with profile"
    });
  }

  async disconnect(profile: string): Promise<void> {
    await this.open(profile);
  }

  async message(
    profile: string,
    text: string
  ): Promise<void> {

    await this.open(profile);

    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "profile",
      action: "message",
      description: "Open message dialog"
    });

    await this.human.adaptiveType({
      platform: "linkedin",
      page: "messages",
      action: "message-body",
      description: "Message input",
      text
    });

    await this.human.press("textarea", "Enter");

  }

  async about(): Promise<string> {
    return await this.human.evaluate(() =>
      document.querySelector("#about ~ *")?.textContent?.trim() || ""
    );
  }

  async skills(): Promise<string[]> {
    return await this.human.evaluate(() =>
      Array.from(
        document.querySelectorAll("[id*=skills] span")
      )
      .map(e => e.textContent?.trim() || "")
      .filter(Boolean)
    );
  }

  async experience(): Promise<LinkedInExperience[]> {
    return await this.human.evaluate(() =>
      Array.from(
        document.querySelectorAll("[id*=experience] li")
      ).map((e:any)=>({
        company:"",
        title:e.innerText
      }))
    );
  }

  async education(): Promise<LinkedInEducation[]> {
    return await this.human.evaluate(() =>
      Array.from(
        document.querySelectorAll("[id*=education] li")
      ).map((e:any)=>({
        school:e.innerText
      }))
    );
  }

  async contact(): Promise<LinkedInContact> {
    return {};
  }

  async posts(): Promise<LinkedInPost[]> {
    return [];
  }

  async followers(): Promise<number> {
    return 0;
  }

  async connections(): Promise<number> {
    return 0;
  }

  async mutualConnections(): Promise<number> {
    return 0;
  }

}
