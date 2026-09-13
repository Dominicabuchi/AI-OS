import { Runtime } from "./runtime";
import { Mission } from "@ai-os/shared";
import { ActionExecutor } from "../executor/action-executor";
import { generate } from "@ai-os/model-runtime";
import { parsePlan } from "../parser/plan";
import { getAgent } from "@ai-os/agent-runtime";

export class AIRuntime implements Runtime {

  private executor = new ActionExecutor();

  async observe(_: Mission) {}

  async think(
    mission: Mission
  ) {

    const agent = getAgent(
      mission.agent
    );

    const prompt =
      await agent.buildPrompt(
        mission
      );

    const response =
      await generate({

        agent: agent.id,

        task: "mission",

        prompt,

        system:
          agent.systemPrompt

      });

    console.log("========== RAW MODEL RESPONSE ==========");
    console.log(response.text);
    console.log("========================================");

    return parsePlan(
      response.text
    );

  }

  async act(
    _: Mission,
    plan: any
  ) {

    for (const action of plan.actions)
      await this.executor.execute(
        action
      );

  }

  async learn(_: Mission) {}

  async run(
    mission: Mission
  ) {

    try {

      while (mission.enabled) {

        await this.observe(
          mission
        );

        const plan =
          await this.think(
            mission
          );

        await this.act(
          mission,
          plan
        );

        await this.learn(
          mission
        );

        if (
          plan.actions.some(
            (a: any) =>
              a.type === "finish"
          )
        )
          break;

        if (
          mission.policy === "once"
        )
          break;

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              mission.interval ??
                5000
            )
        );

      }

    } finally {

      await this.executor.close();

    }

  }

}
