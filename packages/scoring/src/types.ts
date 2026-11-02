import type {
  NormalizedContribution,
  NormalizedContributor,
  NormalizedLanguage,
  NormalizedRelease,
  NormalizedRepository,
} from "@ossintel/github-normalizer";
import type {
  ManifestDetectionResult,
  MultiManifestDetectionResult,
  PackageManifest,
} from "@ossintel/input-parser";
import type { NormalizedNpmPackage, NormalizedNpmUser } from "@ossintel/npm";
import type { NormalizedStackOverflowUser } from "@ossintel/stackoverflow";

export type {
  ManifestDetectionResult,
  MultiManifestDetectionResult,
  PackageManifest,
};

export interface PackageVelocity {
  /**
   * Weekly downloads (e.g. from npm)
   */
  weeklyDownloads?: number;
  /**
   * Monthly downloads (e.g. from npm)
   */
  monthlyDownloads?: number;
  /**
   * Real-world installations (e.g. VS Code Marketplace installs)
   */
  installs?: number;
  /**
   * General download count
   */
  downloads?: number;
}

export interface ScoringInputs {
  repository: NormalizedRepository;
  contributors?: NormalizedContributor[];
  releases?: NormalizedRelease[];
  languages?: NormalizedLanguage[];
  /**
   * Raw or parsed package.json manifest for auto-detecting npm packages and VS Code extensions
   */
  packageManifest?: PackageManifest | string | null;
  /**
   * Multiple package.json manifests for monorepos or multi-package workspaces
   */
  packageManifests?: Array<PackageManifest | string> | null;
  /**
   * Associated npm package details if resolved
   */
  npmPackage?: NormalizedNpmPackage | null;
  /**
   * Multiple npm package details for monorepos or multi-package workspaces
   */
  npmPackages?: NormalizedNpmPackage[] | null;
  /**
   * Real-world installation/download velocity metrics
   */
  packageVelocity?: PackageVelocity | null;
  /**
   * Real-world installation/download velocity metrics across multiple packages in a monorepo
   */
  packageVelocities?: PackageVelocity[] | null;
}

export interface RepositoryScores {
  overall: number;
  health: number;
  impact: number;
  activity: number;
  community: number;
  risk: number;
  /**
   * Installation velocity score (0-100)
   */
  velocity?: number;
  /**
   * Package or extension classification result
   */
  manifestDetection?: ManifestDetectionResult;
  /**
   * Multi-manifest / monorepo classification result
   */
  multiManifestDetection?: MultiManifestDetectionResult;
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
