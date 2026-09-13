export interface IntelligenceRequest {
  missionId: string;
  agentId: string;
  goal: string;
}

export interface Intelligence {

  memory?: unknown;

  knowledge?: unknown;

  browser?: unknown;

  research?: unknown;

  preferences?: unknown;

  reasoning?: unknown;

  files?: unknown;

  environment?: unknown;

  shared?: unknown;

  eoip?: unknown;

  [key: string]: unknown;

}
