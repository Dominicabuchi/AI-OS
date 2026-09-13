import { Lead } from "./types";

export class FollowupEngine {

  shouldFollowUp(
    lead: Lead,
    now = new Date(),
  ) {

    if (!lead.nextFollowup) {
      return false;
    }

    return (
      new Date(lead.nextFollowup).getTime() <=
      now.getTime()
    );

  }

}
