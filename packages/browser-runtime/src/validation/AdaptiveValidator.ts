import {

  ValidationCollector

} from "./ValidationReport";

export class AdaptiveValidator {

  readonly collector =
    new ValidationCollector();

  async stage(

    name: string,

    fn: () => Promise<void>

  ): Promise<void> {

    const started =
      Date.now();

    try {

      await fn();

      this.collector.add({

        name,

        status: "PASS",

        duration:
          Date.now() - started,

        message: "OK"

      });

    }

    catch (error) {

      this.collector.add({

        name,

        status: "FAIL",

        duration:
          Date.now() - started,

        message:
          error instanceof Error
            ? error.message
            : String(error),

        details: error

      });

      throw error;

    }

  }

}
