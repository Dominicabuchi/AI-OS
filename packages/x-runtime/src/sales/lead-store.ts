import { Lead } from "./types";

export class LeadStore {

  private readonly leads =
    new Map<string, Lead>();

  add(lead: Lead) {
    this.leads.set(lead.id, lead);
  }

  get(id: string) {
    return this.leads.get(id);
  }

  all() {
    return [...this.leads.values()];
  }

  remove(id: string) {
    this.leads.delete(id);
  }

}
