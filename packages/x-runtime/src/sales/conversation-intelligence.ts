export interface ConversationAnalysis {

  interested: boolean;

  confidence: number;

  sentiment: number;

  objections: string[];

  nextAction: string;

}

export class ConversationIntelligence {

  analyze(
    conversation: string[],
  ): ConversationAnalysis {

    return {

      interested: false,

      confidence: 0,

      sentiment: 0,

      objections: [],

      nextAction: "reply"

    };

  }

}
