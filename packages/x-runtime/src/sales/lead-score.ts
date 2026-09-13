import { Lead } from "./types";

export class LeadScorer {

  score(
    lead: Lead,
  ) {

    let score = lead.score;

    if (lead.lastContact) {
      score += 5;
    }

    if (lead.notes?.length) {
      score += lead.notes.length;
    }

    return score;

  }

}
