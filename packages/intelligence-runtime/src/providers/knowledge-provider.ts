import { IntelligenceProvider } from "./provider";
import { IntelligenceRequest } from "../types";
import {
  KnowledgeDocument,
  getKnowledgeByCategory,
  loadKnowledge
} from "@ai-os/shared";

export interface KnowledgeEntry
  extends KnowledgeDocument {
  content: string;
}

export interface KnowledgeResult {
  goal: string;
  knowledge: KnowledgeEntry[];
}

interface KnowledgeSection {
  title: string;
  content: string;
}

const SECTION_KEYWORDS: Record<string, string[]> = {
  "COMPANY IDENTITY": [
    "evexai", "company", "organization", "business", "mission",
    "vision", "brand", "about", "identity"
  ],
  "MESSAGING & POSITIONING INTELLIGENCE": [
    "message", "messaging", "position", "positioning", "headline",
    "tagline", "value proposition", "landing page", "brand"
  ],
  "PRODUCT INTELLIGENCE": [
    "product", "feature", "platform", "recruiter", "candidate",
    "hiring", "app", "website", "evexai"
  ],
  "BUYER INTELLIGENCE": [
    "buyer", "customer", "persona", "audience", "recruiter",
    "founder", "hiring manager", "talent acquisition", "hr"
  ],
  "SALES INTELLIGENCE": [
    "sales", "sell", "prospect", "lead", "outreach", "deal",
    "discovery", "demo", "pipeline", "close"
  ],
  "MARKETING INTELLIGENCE": [
    "marketing", "campaign", "advertising", "ads", "seo",
    "content", "growth", "lead generation", "traffic"
  ],
  "COPYWRITING INTELLIGENCE": [
    "copy", "copywriting", "write", "writing", "blog", "article",
    "headline", "email", "landing page", "cta", "content"
  ],
  "COMPETITIVE INTELLIGENCE": [
    "competitor", "competition", "competitive", "alternative",
    "versus", " vs ", "differentiate", "comparison"
  ],
  "ORGANIZATIONAL OPERATING STANDARDS": [
    "objection", "standard", "policy", "operating", "communication",
    "trust", "professional", "customer concern"
  ]
};

function parseSections(content: string): KnowledgeSection[] {
  const lines = content.split(/\r?\n/);
  const sections: KnowledgeSection[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!/^={20,}\s*$/.test(lines[i])) {
      continue;
    }

    const title = (lines[i + 1] ?? "").trim();

    if (!title || /^={20,}$/.test(title)) {
      continue;
    }

    let end = lines.length;

    for (let j = i + 2; j < lines.length; j++) {
      if (
        /^={20,}\s*$/.test(lines[j]) &&
        (lines[j + 1] ?? "").trim() &&
        !/^={20,}$/.test((lines[j + 1] ?? "").trim())
      ) {
        end = j;
        break;
      }
    }

    sections.push({
      title,
      content: lines.slice(i, end).join("\n").trim()
    });
  }

  return sections;
}

function escapeRegExp(
  value: string
): string {
  return value.replace(
    /[.*+?^${}()|[\\]\\]/g,
    "\\$&"
  );
}

function goalMatchesKeyword(
  goal: string,
  keyword: string
): boolean {
  const normalizedKeyword =
    keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return false;
  }

  /*
   * Match complete words / phrases only.
   *
   * This prevents false positives such as:
   *   keyword "product"
   *   goal    "production deployment"
   *
   * while preserving legitimate matches such as:
   *   "product strategy"
   *   "hiring manager"
   *   "landing page"
   */
  const pattern =
    normalizedKeyword
      .split(/\\s+/)
      .map(escapeRegExp)
      .join("\\s+");

  const regex = new RegExp(
    `(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`,
    "i"
  );

  return regex.test(goal);
}

function selectRelevantSections(
  content: string,
  goal: string
): string {
  const normalizedGoal =
    goal.toLowerCase();

  const sections =
    parseSections(content);

  const relevant =
    sections.filter(section => {
      const keywords =
        SECTION_KEYWORDS[
          section.title
        ] ?? [];

      return keywords.some(
        keyword =>
          goalMatchesKeyword(
            normalizedGoal,
            keyword
          )
      );
    });

  return relevant
    .map(section => section.content)
    .join("\n\n");
}

export class KnowledgeProvider
  implements IntelligenceProvider<KnowledgeResult> {
  readonly id = "knowledge";

  async collect(
    request: IntelligenceRequest
  ): Promise<KnowledgeResult> {
    const documents =
      getKnowledgeByCategory("organization");

    const loaded = await Promise.all(
      documents.map(async document => ({
        document,
        content: await loadKnowledge(document.path)
      }))
    );

    const knowledge: KnowledgeEntry[] = loaded
      .map(({ document, content }) => ({
        ...document,
        content: selectRelevantSections(
          content,
          request.goal
        )
      }))
      .filter(entry => entry.content.length > 0);

    return {
      goal: request.goal,
      knowledge
    };
  }
}
