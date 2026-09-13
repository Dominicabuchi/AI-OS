export enum LeadStage {

  New = "new",

  Contacted = "contacted",

  Replied = "replied",

  Interested = "interested",

  Qualified = "qualified",

  Negotiating = "negotiating",

  Won = "won",

  Lost = "lost"

}

export interface Lead {

  id: string;

  username?: string;

  name?: string;

  company?: string;

  stage: LeadStage;

  score: number;

  lastContact?: string;

  nextFollowup?: string;

  notes?: string[];

}

export interface Campaign {

  id: string;

  name: string;

  leads: Lead[];

}
