import fs from "node:fs";
import path from "node:path";

import { Lead } from "./types";

export class LeadStore {

  private readonly file =
    process.env.AI_OS_SALES_LEADS_STORE ??
    path.join(
      path.resolve(
        process.env.AI_OS_STATE_DIR ?? ".ai-os"
      ),
      "sales",
      "leads.json"
    );

  constructor() {

    this.ensure();

  }

  private ensure(): void {

    fs.mkdirSync(
      path.dirname(this.file),
      {
        recursive: true
      }
    );

    if (!fs.existsSync(this.file)) {

      fs.writeFileSync(
        this.file,
        "[]\n",
        "utf8"
      );

    }

  }

  private load(): Lead[] {

    this.ensure();

    try {

      const parsed =
        JSON.parse(
          fs.readFileSync(
            this.file,
            "utf8"
          )
        );

      return Array.isArray(parsed)
        ? parsed as Lead[]
        : [];

    } catch {

      return [];

    }

  }

  private persist(
    leads: Lead[]
  ): void {

    this.ensure();

    fs.writeFileSync(
      this.file,
      JSON.stringify(
        leads,
        null,
        2
      ) + "\n",
      "utf8"
    );

  }

  private proxy(
    lead: Lead
  ): Lead {

    return new Proxy(
      lead,
      {
        set: (
          target,
          property,
          value
        ) => {

          Reflect.set(
            target,
            property,
            value
          );

          const leads = this.load();

          const index =
            leads.findIndex(
              item =>
                item.id === target.id
            );

          if (index >= 0) {

            leads[index] = {
              ...target
            };

          } else {

            leads.push({
              ...target
            });

          }

          this.persist(leads);

          return true;

        }
      }
    );

  }

  add(
    lead: Lead
  ) {

    const leads = this.load();

    const index =
      leads.findIndex(
        item =>
          item.id === lead.id
      );

    if (index >= 0) {

      leads[index] = lead;

    } else {

      leads.push(lead);

    }

    this.persist(leads);

  }

  get(
    id: string
  ) {

    const lead =
      this.load().find(
        item =>
          item.id === id
      );

    return lead
      ? this.proxy(lead)
      : undefined;

  }

  all() {

    return this.load().map(
      lead =>
        this.proxy(lead)
    );

  }

  remove(
    id: string
  ) {

    const leads =
      this.load().filter(
        lead =>
          lead.id !== id
      );

    this.persist(leads);

  }

}
