import { ValidationReport } from "./ValidationTypes";

export class ValidationPrinter {

  static print(
    report: ValidationReport
  ): void {

    console.log("");

    console.log("==================================================");
    console.log("        ADAPTIVE VALIDATION REPORT");
    console.log("==================================================");

    console.log(
      `${report.platform} / ${report.page} / ${report.action}`
    );

    console.log("");

    for (const stage of report.stages) {

      console.log(
        `[${stage.status}] ${stage.name}`
      );

      console.log(
        `  ${stage.message}`
      );

      console.log(
        `  ${stage.duration} ms`
      );

      if (stage.details) {

        console.log(
          stage.details
        );

      }

      console.log("");

    }

    console.log("==================================================");
    console.log("");

  }

}
