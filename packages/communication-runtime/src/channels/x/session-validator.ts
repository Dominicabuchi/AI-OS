import {
  SessionValidator,
  SessionState
} from "@ai-os/browser-runtime";

export class XSessionValidator extends SessionValidator {

  async validate(): Promise<SessionState> {

    await this.human.goto(
      "https://x.com/home"
    );

    const authenticated =
      await this.human.exists(
        "input[placeholder='Search'], input[aria-label='Search']"
      );

    return {
      platform: "x",
      authenticated,
      lastValidated: new Date()
    };

  }

}
