import type {
  NormalizedContributor,
  NormalizedLanguage,
  NormalizedRelease,
  NormalizedRepository,
} from "@ossintel/github-normalizer";

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
