import type {
  NormalizedContribution,
  NormalizedContributor,
  NormalizedLanguage,
  NormalizedRelease,
  NormalizedRepository,
} from "@ossintel/github-normalizer";
import type { NormalizedNpmUser } from "@ossintel/npm";
import type { NormalizedStackOverflowUser } from "@ossintel/stackoverflow";

export interface ScoringInputs {
  repository: NormalizedRepository;
  contributors?: NormalizedContributor[];
  releases?: NormalizedRelease[];
  languages?: NormalizedLanguage[];
}

export interface RepositoryScores {
  overall: number;
  health: number;
  impact: number;
  activity: number;
  community: number;
  risk: number;
}

export interface TopicExpertise {
  topic: string;
  score: number; // 0-100
  evidence: {
    githubStars: number;
    githubPrs: number;
    npmDownloads: number;
    npmPackages: number;
    stackoverflowScore: number;
    stackoverflowAnswers: number;
  };
}

export interface IdentityScoringInputs {
  repositories: NormalizedRepository[];
  npmUser?: NormalizedNpmUser | null;
  stackoverflowUser?: NormalizedStackOverflowUser | null;
  externalContributions?: NormalizedContribution[];
  organizations?: {
    login?: string;
    publicRepos: number;
    followers?: number;
    stars?: number;
  }[];
}

export interface PillarEvidence {
  maintainer: string[];
  contributor: string[];
  influence: string[];
  organization: string[];
}

export interface PillarFactors {
  maintainer: string[];
  contributor: string[];
  influence: string[];
  organization: string[];
}

export interface IdentityScores {
  overall: number;
  maintainer: number;
  contributor: number;
  organization: number;
  influence: number;
  confidence: "High" | "Medium" | "Low";
  evidence: PillarEvidence;
  factors: PillarFactors;
  badges: string[];
  skills: TopicExpertise[];
}
