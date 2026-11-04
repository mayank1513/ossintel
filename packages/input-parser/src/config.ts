export interface LanguageOverride {
  language: string;
  reason?: string;
}

export interface PathOverride {
  pattern: string;
  reason?: string;
}

export interface RepoOverride {
  repo: string;
  reason?: string;
}

export interface OrgOverride {
  org: string;
  reason?: string;
}

export interface RawOssintelConfig {
  $schema?: string;
  version?: "1" | "1.0" | string;
  profile?: {
    orgs?: {
      priority?: Array<string | { org: string; reason?: string }>;
      exclude?: Array<string | { org: string; reason?: string }>;
    };
    repositories?: {
      pinned?: Array<string | { repo: string; reason?: string }>;
      exclude?: Array<string | { repo: string; reason?: string }>;
    };
  };
  telemetry?: {
    languages?: {
      ignore?: Array<string | { language: string; reason?: string }>;
      primaryOverride?: string;
    };
    ignorePaths?: Array<string | { pattern: string; reason?: string }>;
    monorepo?: {
      workspaces?: string[];
      mainPackages?: string[];
    };
  };
  narrative?: {
    summary?: string;
    highlights?: string[];
  };
}

export interface NormalizedOssintelConfig {
  version: string;
  profile: {
    orgs: {
      priority: OrgOverride[];
      exclude: OrgOverride[];
    };
    repositories: {
      pinned: RepoOverride[];
      exclude: RepoOverride[];
    };
  };
  telemetry: {
    languages: {
      ignore: LanguageOverride[];
      primaryOverride?: string;
    };
    ignorePaths: PathOverride[];
    monorepo?: {
      workspaces?: string[];
      mainPackages?: string[];
    };
  };
  narrative?: {
    summary?: string;
    highlights?: string[];
  };
}

const normalizeOrg = (
  item: string | { org: string; reason?: string },
): OrgOverride => {
  if (typeof item === "string") {
    return { org: item.toLowerCase().trim() };
  }
  return {
    org: (item.org || "").toLowerCase().trim(),
    reason: item.reason,
  };
};

const normalizeRepo = (
  item: string | { repo: string; reason?: string },
): RepoOverride => {
  if (typeof item === "string") {
    return { repo: item.toLowerCase().trim() };
  }
  return {
    repo: (item.repo || "").toLowerCase().trim(),
    reason: item.reason,
  };
};

const normalizeLanguage = (
  item: string | { language: string; reason?: string },
): LanguageOverride => {
  if (typeof item === "string") {
    return { language: item.trim() };
  }
  return {
    language: (item.language || "").trim(),
    reason: item.reason,
  };
};

const normalizePath = (
  item: string | { pattern: string; reason?: string },
): PathOverride => {
  if (typeof item === "string") {
    return { pattern: item.trim().replace(/\\/g, "/") };
  }
  return {
    pattern: (item.pattern || "").trim().replace(/\\/g, "/"),
    reason: item.reason,
  };
};

/**
 * Normalizes a raw parsed .ossintel.json object into a type-safe structure.
 */
export const normalizeOssintelConfig = (
  raw: unknown,
): NormalizedOssintelConfig => {
  if (!raw || typeof raw !== "object") {
    return {
      version: "1",
      profile: {
        orgs: { priority: [], exclude: [] },
        repositories: { pinned: [], exclude: [] },
      },
      telemetry: {
        languages: { ignore: [] },
        ignorePaths: [],
      },
    };
  }

  const c = raw as RawOssintelConfig;

  return {
    version: c.version || "1",
    profile: {
      orgs: {
        priority: (c.profile?.orgs?.priority || []).map(normalizeOrg),
        exclude: (c.profile?.orgs?.exclude || []).map(normalizeOrg),
      },
      repositories: {
        pinned: (c.profile?.repositories?.pinned || []).map(normalizeRepo),
        exclude: (c.profile?.repositories?.exclude || []).map(normalizeRepo),
      },
    },
    telemetry: {
      languages: {
        ignore: (c.telemetry?.languages?.ignore || []).map(normalizeLanguage),
        primaryOverride: c.telemetry?.languages?.primaryOverride,
      },
      ignorePaths: (c.telemetry?.ignorePaths || []).map(normalizePath),
      monorepo: c.telemetry?.monorepo,
    },
    narrative: c.narrative,
  };
};

/**
 * Checks if a language is excluded by the configuration.
 */
export const shouldIgnoreLanguage = (
  language: string,
  config?: NormalizedOssintelConfig,
): boolean => {
  if (!config || !language) return false;
  const target = language.toLowerCase().trim();
  return config.telemetry.languages.ignore.some(
    (item) => item.language.toLowerCase() === target,
  );
};

/**
 * Retrieves user-facing reason for language exclusion if configured.
 */
export const getLanguageIgnoreReason = (
  language: string,
  config?: NormalizedOssintelConfig,
): string | undefined => {
  if (!config || !language) return undefined;
  const target = language.toLowerCase().trim();
  const match = config.telemetry.languages.ignore.find(
    (item) => item.language.toLowerCase() === target,
  );
  return match?.reason;
};

/**
 * Simple glob and path matching utility.
 * Supports exact matches, directory prefixes (e.g. "docs/"), and wildcards ("*" and "**").
 */
export const matchGlobPattern = (pattern: string, pathStr: string): boolean => {
  const normPath = pathStr.replace(/\\/g, "/").replace(/^\//, "");
  const normPattern = pattern.replace(/\\/g, "/").replace(/^\//, "");

  // Direct exact match
  if (normPath === normPattern) return true;

  // Directory prefix match: if pattern ends with "/" or is a directory prefix
  if (normPattern.endsWith("/") && normPath.startsWith(normPattern)) {
    return true;
  }

  if (normPath.startsWith(`${normPattern}/`)) {
    return true;
  }

  // Convert glob pattern to regex
  const escaped = normPattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "___GLOBSTAR___")
    .replace(/\*/g, "[^/]*")
    .replace(/___GLOBSTAR___/g, ".*");

  const regex = new RegExp(`^${escaped}$`, "i");
  return regex.test(normPath);
};

/**
 * Checks if a file path or directory should be ignored according to config.
 */
export const shouldIgnorePath = (
  filePath: string,
  config?: NormalizedOssintelConfig,
): boolean => {
  if (!config || !filePath) return false;
  return config.telemetry.ignorePaths.some((item) =>
    matchGlobPattern(item.pattern, filePath),
  );
};

/**
 * Retrieves the user-facing explanation for path exclusion if configured.
 */
export const getPathIgnoreReason = (
  filePath: string,
  config?: NormalizedOssintelConfig,
): string | undefined => {
  if (!config || !filePath) return undefined;
  const match = config.telemetry.ignorePaths.find((item) =>
    matchGlobPattern(item.pattern, filePath),
  );
  return match?.reason;
};

/**
 * Checks if a repository should be omitted from scoring or display.
 */
export const shouldExcludeRepo = (
  repoFullName: string,
  config?: NormalizedOssintelConfig,
): boolean => {
  if (!config || !repoFullName) return false;
  const target = repoFullName.toLowerCase().trim();
  return config.profile.repositories.exclude.some(
    (item) =>
      item.repo === target ||
      (item.repo.includes("/") ? false : target.endsWith(`/${item.repo}`)),
  );
};
