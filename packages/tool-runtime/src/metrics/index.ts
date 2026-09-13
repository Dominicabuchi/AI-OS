const metrics =
  new Map<
    string,
    number
  >();

export function recordExecution(
  toolId: string
): void {

  metrics.set(
    toolId,
    (metrics.get(toolId) ?? 0) + 1
  );

}

export function getMetrics() {

  return Object.fromEntries(
    metrics
  );

}
