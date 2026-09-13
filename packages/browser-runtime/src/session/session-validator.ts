import { HumanBrowser } from "../human";
import { SessionState } from "./session-state";

export abstract class SessionValidator {

  constructor(
    protected readonly human: HumanBrowser
  ) {}

  abstract validate(): Promise<SessionState>;

}
