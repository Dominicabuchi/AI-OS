import { KnowledgeDocument } from "../types";

const registry: KnowledgeDocument[] = [

  {
    id: "evexai.organization",
    category: "organization",
    path: "organizations/evexai.organization.md",
    title: "EvexAI Organization"
  }

];

export function getKnowledgeRegistry(): KnowledgeDocument[] {

  return registry;

}

export function getKnowledgeByCategory(
  category: KnowledgeDocument["category"]
): KnowledgeDocument[] {

  return registry.filter(
    document => document.category === category
  );

}
