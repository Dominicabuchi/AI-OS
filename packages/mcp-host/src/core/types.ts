export interface MCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: unknown;
}

export interface MCPResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface MCPNotification {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
}

export interface MCPTransport {
  connect(): Promise<void>;
  close(): Promise<void>;
  call(
    method: string,
    params?: unknown
  ): Promise<MCPResponse>;
}

export interface MCPRemoteConfig {
  url: string;
  headers?: Record<string, string>;
}
