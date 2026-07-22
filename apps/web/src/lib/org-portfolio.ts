export interface EnrichedRepo {
  repoName: string;
  fullName: string;
  scores: { overall: number; risk: number };
  stars: number;
  forks: number;
  isArchived: boolean;
  isFork: boolean;
  createdAt: string;
  pushedAt: string;
  language: string | null;
  topics: string[];
  description: string | null;
  openIssuesCount: number;
  isPinned?: boolean;
}

export type LifecycleStage =
  | "core"
  | "growing"
  | "stable"
  | "maintenance"
  | "incubating"
  | "experimental"
  | "legacy"
  | "archived";

export interface LifecycleDefinition {
  id: LifecycleStage;
  label: string;
  description: string;
  colorClass: string;
}

export const LIFECYCLE_STAGES: LifecycleDefinition[] = [
  {
    id: "core",
    label: "Core Flagships",
    description: "Strategic projects of key importance driving the ecosystem.",
    colorClass: "border-red-500/20 bg-red-500/5 text-red-400",
  },
  {
    id: "growing",
    label: "Growing",
    description:
      "Active projects with rapid adoption and high contribution velocity.",
    colorClass: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
  },
  {
    id: "stable",
    label: "Stable Modules",
    description: "Mature modules with solid adoption and reliable maintenance.",
    colorClass: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
  },
  {
    id: "incubating",
    label: "Incubating",
    description:
      "Newly active projects with low adoption but steady commit cycles.",
    colorClass: "border-sky-500/20 bg-sky-500/5 text-sky-400",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description:
      "Stable utilities that do not require frequent feature updates.",
    colorClass: "border-amber-500/20 bg-amber-500/5 text-amber-400",
  },
  {
    id: "experimental",
    label: "Experimental",
    description: "Prototypes, drafts, or internal incubator templates.",
    colorClass: "border-pink-500/20 bg-pink-500/5 text-pink-400",
  },
  {
    id: "legacy",
    label: "Legacy",
    description: "Inactive repositories that remain widely used historically.",
    colorClass: "border-purple-500/20 bg-purple-500/5 text-purple-400",
  },
  {
    id: "archived",
    label: "Archived",
    description: "Explicitly archived on GitHub by organization owners.",
    colorClass: "border-slate-800 bg-slate-950 text-slate-500",
  },
];

export function classifyRepository(
  repo: EnrichedRepo,
  pinnedNames: Set<string>,
): LifecycleStage {
  // 1. Archived
  if (repo.isArchived) {
    return "archived";
  }

  const now = Date.now();
  const createdTime = repo.createdAt ? new Date(repo.createdAt).getTime() : now;
  const pushedTime = repo.pushedAt ? new Date(repo.pushedAt).getTime() : 0;

  const ageInDays = (now - createdTime) / (24 * 60 * 60 * 1000);
  const inactiveDays = (now - pushedTime) / (24 * 60 * 60 * 1000);
  const isActive = inactiveDays < 180; // pushed in last 6 months

  const isPinned = repo.isPinned || pinnedNames.has(repo.repoName);

  // 2. Legacy: no pushes in 1.5+ years but has substantial adoption
  if (inactiveDays > 540 && repo.stars >= 15) {
    return "legacy";
  }

  // 3. Core: Pinned active repos or high-impact/adoption flagship repos
  if (isPinned && isActive) {
    return "core";
  }
  if (repo.stars >= 150 && repo.scores.overall >= 75 && isActive) {
    return "core";
  }

  // 4. Growing: Pushed recently, created recently or has rising star counts
  if (isActive && ageInDays < 365 && repo.stars >= 25) {
    return "growing";
  }
  if (isActive && repo.stars >= 50 && repo.scores.overall >= 60) {
    return "growing";
  }

  // 5. Stable: Mature, pushed recently (or in last 9 months), low risk, and decent age
  if (
    inactiveDays < 270 &&
    ageInDays > 180 &&
    repo.scores.overall >= 50 &&
    repo.scores.risk < 35
  ) {
    return "stable";
  }

  // 6. Incubating: New and active (pushed recently), but not yet highly adopted
  if (isActive && ageInDays < 270 && repo.stars < 25) {
    return "incubating";
  }

  // 7. Maintenance Mode: Stable, pushes are sparse (older than 6 months but less than 1.5 years)
  if (inactiveDays >= 180 && inactiveDays <= 540 && repo.stars >= 5) {
    return "maintenance";
  }

  // 8. Experimental: Low stars, prototype description keywords, or default fallback
  return "experimental";
}

export function groupRepositoriesByLifecycle(
  repositories: EnrichedRepo[],
  pinnedRepositories: string[],
): Record<LifecycleStage, EnrichedRepo[]> {
  const groups: Record<LifecycleStage, EnrichedRepo[]> = {
    core: [],
    growing: [],
    stable: [],
    maintenance: [],
    incubating: [],
    experimental: [],
    legacy: [],
    archived: [],
  };

  const pinnedNames = new Set(pinnedRepositories);

  for (const repo of repositories) {
    const stage = classifyRepository(repo, pinnedNames);
    groups[stage].push(repo);
  }

  return groups;
}
