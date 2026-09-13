import { Lead } from "./types";

export interface SequenceStep {

  id: string;

  delayHours: number;

  message: string;

}

export class Sequence {

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly steps: SequenceStep[],
  ) {}

  nextStep(
    lead: Lead,
    completed: number,
  ): SequenceStep | undefined {

    return this.steps[completed];

  }

}
