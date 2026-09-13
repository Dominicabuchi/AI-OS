export interface Tool {

  readonly id: string;

  readonly name: string;

  readonly description: string;

  canExecute(
    action: string
  ): boolean;

  execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown>;

}
