export type LinkedInSearchType =
  | "person"
  | "company"
  | "job"
  | "post";

export interface LinkedInSearchResult {
  id?: string;
  type: LinkedInSearchType;
  title: string;
  subtitle?: string;
  url: string;
}
