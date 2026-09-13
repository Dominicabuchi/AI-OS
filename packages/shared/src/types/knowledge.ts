export type KnowledgeCategory =
  | "organization"
  | "product"
  | "buyer"
  | "competitor"
  | "strategy"
  | "playbook"
  | "persona"
  | "faq";

export interface KnowledgeDocument {

  id: string;

  category: KnowledgeCategory;

  path: string;

  title: string;

  description?: string;

}
