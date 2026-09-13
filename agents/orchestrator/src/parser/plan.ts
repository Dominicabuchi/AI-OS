export interface ExecutionPlan {
  thought: string;
  actions: {
    type: string;
    payload: Record<string, unknown>;
  }[];
}

export function parsePlan(text: string): ExecutionPlan {
  let plan: any;

  try {
    plan = JSON.parse(text);
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  if (Array.isArray(plan.actions)) {
    return plan as ExecutionPlan;
  }

  const normalize = (steps: any[]) => ({
    thought: "",
    actions: steps.map((step: any) => ({
      type: step.tool
        ? `${step.tool}.${step.action}`
        : step.action,
      payload:
        step.parameters ??
        step.params ??
        step.payload ??
        {}
    }))
  });

  if (Array.isArray(plan.plan)) {
    return normalize(plan.plan);
  }

  if (Array.isArray(plan.steps)) {
    return normalize(plan.steps);
  }

  if (
    typeof plan === "object" &&
    plan !== null &&
    "tool" in plan &&
    "function" in plan
  ) {
    return {
      thought: "",
      actions: [
        {
          type: `${plan.tool}.${plan.function}`,
          payload: plan.parameters ?? plan.params ?? {}
        }
      ]
    };
  }

  throw new Error("Invalid execution plan.");
}
