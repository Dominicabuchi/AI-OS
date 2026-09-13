import {
  SessionValidator,
  SessionState
} from "@ai-os/browser-runtime";

export class LinkedInSessionValidator extends SessionValidator {

  async validate(): Promise<SessionState> {

    await this.human.goto(
      "https://www.linkedin.com/feed/"
    );

    const authenticated =
      await this.human.exists(
        "input[placeholder='Search'], input[aria-label='Search']"
      );

    return {
      platform: "linkedin",
      authenticated,
      lastValidated: new Date()
    };

  }

}
