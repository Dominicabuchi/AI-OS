export * from "./types/agent";
export * from "./registry";
export * from "./sdk/base-agent";

export * from "./agents/general-agent";
export * from "./agents/browser-agent";
export * from "./agents/research-agent";
export * from "./agents/manager-agent";
export * from "./agents/customer-success-agent";
export * from "./agents/sales-agent";
export * from "./agents/landing-page-agent";
export * from "./agents/seo-agent";
export * from "./agents/marketing-agent";
export * from "./agents/copywriting-agent";
export * from "./agents/communication-agent";
export * from "./agents/coding-agent";
export * from "./agents/memory-agent";
export * from "./agents/reasoning-agent";

import { registerAgent } from "./registry";

import { GeneralAgent } from "./agents/general-agent";
import { BrowserAgent } from "./agents/browser-agent";
import { ResearchAgent } from "./agents/research-agent";
import { ManagerAgent } from "./agents/manager-agent";
import { CustomerSuccessAgent } from "./agents/customer-success-agent";
import { SalesAgent } from "./agents/sales-agent";
import { LandingPageAgent } from "./agents/landing-page-agent";
import { SeoAgent } from "./agents/seo-agent";
import { MarketingAgent } from "./agents/marketing-agent";
import { CopywritingAgent } from "./agents/copywriting-agent";
import { CommunicationAgent } from "./agents/communication-agent";
import { CodingAgent } from "./agents/coding-agent";
import { MemoryAgent } from "./agents/memory-agent";
import { ReasoningAgent } from "./agents/reasoning-agent";
import { PlanningAgent } from "./agents/planning-agent";

// DISABLED FOR PRODUCTION DEPLOYMENT: General Agent is offline.
// registerAgent(new GeneralAgent());
registerAgent(new BrowserAgent());
registerAgent(new ResearchAgent());

registerAgent(new PlanningAgent());

registerAgent(new ReasoningAgent());

registerAgent(new MemoryAgent());

registerAgent(new CodingAgent());

registerAgent(new CommunicationAgent());

registerAgent(new CopywritingAgent());

registerAgent(new MarketingAgent());

registerAgent(new SeoAgent());

// DISABLED FOR PRODUCTION DEPLOYMENT: LandingPage Agent is temporarily offline.
// registerAgent(new LandingPageAgent());

registerAgent(new SalesAgent());

// DISABLED FOR PRODUCTION DEPLOYMENT: Customer Success Agent is offline.
// registerAgent(new CustomerSuccessAgent());


// DISABLED FOR PRODUCTION DEPLOYMENT: Manager Agent is offline.
// registerAgent(new ManagerAgent());

export * from "./knowledge";
