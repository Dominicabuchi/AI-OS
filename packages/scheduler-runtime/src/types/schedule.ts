export interface Schedule {

  id: string;

  interval: number;

  enabled: boolean;

  running?: boolean;

  run(): Promise<void>;

}
