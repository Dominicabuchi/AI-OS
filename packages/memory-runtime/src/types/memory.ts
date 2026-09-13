export type MemoryScope =
  | "shared"
  | "private";

export type MemoryType =
  | "working"
  | "episodic"
  | "semantic"
  | "long_term"
  | "entity"
  | "relationship";

export interface Memory {

  id: string;

  missionId?: string;

  agentId?: string;

  scope: MemoryScope;

  type: MemoryType;

  content: string;

  summary?: string;

  embedding?: number[];

  namespace?: string;

  entityId?: string;

  relatedIds?: string[];

  confidence?: number;

  importance?: number;

  accessCount?: number;

  lastAccessedAt?: Date;

  expiresAt?: Date;

  tags?: string[];

  source?: string;

  metadata?: Record<string, unknown>;

  createdAt: Date;

  updatedAt?: Date;

}
