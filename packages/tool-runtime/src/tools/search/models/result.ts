export interface SearchDocument {

  title: string;

  url: string;

  snippet?: string;

  source: string;

  score?: number;

  publishedAt?: string;

  author?: string;

  metadata?: Record<string, unknown>;

}
