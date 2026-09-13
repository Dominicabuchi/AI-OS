import {

  ValidationReport,

  ValidationStage

} from "./ValidationTypes";

export class ValidationCollector {

  private readonly stages: ValidationStage[] = [];

  add(

    stage: ValidationStage

  ) {

    this.stages.push(stage);

  }

  build(

    platform: string,

    page: string,

    action: string,

    startedAt: number

  ): ValidationReport {

    return {

      platform,

      page,

      action,

      startedAt,

      finishedAt: Date.now(),

      stages: this.stages

    };

  }

}
