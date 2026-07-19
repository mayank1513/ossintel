export interface Finding {
  id: string;
  type: "highlight" | "warning";
  category: "health" | "impact" | "activity" | "community" | "risk";
  title: string;
  description: string;
  score?: number;
}

export interface Recommendation {
  id: string;
  category: "health" | "impact" | "activity" | "community" | "risk";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export interface PromptContext {
  summary: string;
  metricsText: string;
  scoresText: string;
  findingsText: string;
  recommendationsText: string;
}

export interface RepositoryInsights {
  findings: Finding[];
  recommendations: Recommendation[];
  promptContext: PromptContext;
}

export interface IdentityMetadata {
  type: "user" | "org";
  login: string;
  name?: string | null;
  linkedIdentities?: {
    npm?: string;
    stackoverflow?: string;
  };
}

export interface IdentityInsights {
  findings: Finding[];
  recommendations: Recommendation[];
  promptContext: PromptContext;
}
