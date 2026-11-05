import type {
  NormalizedContributor,
  NormalizedLanguage,
  NormalizedRelease,
  NormalizedRepository,
} from "@ossintel/github-normalizer";
import type { PackageManifest } from "@ossintel/input-parser";
import type { NormalizedNpmPackage } from "@ossintel/npm";
import type {
  IdentityScores,
  PackageVelocity,
  RepositoryScores,
} from "@ossintel/scoring";
import {
  calculateIdentityScore,
  calculateRepositoryScore,
} from "@ossintel/scoring";
import { Octokit } from "octokit";
import {
  getCachedDeveloperData,
  getCachedRepositoryData,
} from "./server-cache";

export interface ShieldsBadgeData {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
  labelColor?: string;
  isError?: boolean;
  namedLogo?: string;
  logoSvg?: string;
  logoColor?: string;
  logoWidth?: number;
  logoPosition?: string;
  style?: "flat" | "flat-square" | "plastic" | "for-the-badge" | "social";
  cacheSeconds?: number;
}

export type RepoMetric =
  | "overall"
  | "velocity"
  | "health"
  | "activity"
  | "community"
  | "impact"
  | "risk";

export type UserMetric = "overall" | "maintainer" | "contributor" | "influence";

export interface BadgeOptions {
  style?: "flat" | "flat-square" | "plastic" | "for-the-badge" | "social";
  label?: string;
  logo?: string;
  cacheSeconds?: number;
}

export const BADGE_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export const BADGE_CACHE_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control":
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export const BADGE_ERROR_RESPONSE: ShieldsBadgeData = {
  schemaVersion: 1,
  label: "OSSIntel",
  message: "unavailable",
  color: "inactive",
  isError: true,
};

export const parseBadgeQueryParams = (requestUrl: string) => {
  const url = new URL(requestUrl);
  return {
    style:
      (url.searchParams.get("style") as BadgeOptions["style"]) || undefined,
    label: url.searchParams.get("label") || undefined,
    logo: url.searchParams.get("logo") || undefined,
    metric: url.searchParams.get("metric") || "overall",
  };
};

export const createShieldsBadge = (
  label: string,
  message: string,
  color: string,
  options: BadgeOptions = {},
): ShieldsBadgeData => {
  const badge: ShieldsBadgeData = {
    schemaVersion: 1,
    label: options.label || label,
    message,
    color,
    namedLogo: options.logo ?? "github",
    cacheSeconds: options.cacheSeconds ?? 3600,
  };

  if (options.style) {
    badge.style = options.style;
  }

  return badge;
};

export interface RepoBadgeOptions extends BadgeOptions {
  metric?: RepoMetric;
}

export interface UserBadgeOptions extends BadgeOptions {
  metric?: UserMetric;
}

/**
 * Score-to-color mapping calibrated to OSSIntel standard tiers:
 * - 85+: brightgreen (#10b981) - Peak ecosystem tier
 * - 70-84: green (#22c55e) - Solid production grade
 * - 50-69: yellow (#eab308) - Moderate activity
 * - 30-49: orange (#f59e0b) - Low/emerging traction
 * - <30: red (#f43f5e) - Stale or minimal adoption
 */
export const getScoreColor = (score: number): string => {
  if (score >= 85) return "brightgreen";
  if (score >= 70) return "green";
  if (score >= 50) return "yellow";
  if (score >= 30) return "orange";
  return "red";
};

/**
 * Risk score color mapping (inverse: lower is safer):
 * - <= 20: brightgreen (Minimal risk)
 * - <= 40: green (Low risk)
 * - <= 60: yellow (Moderate risk)
 * - <= 80: orange (Elevated risk)
 * - > 80: red (High risk)
 */
export const getRiskScoreColor = (risk: number): string => {
  if (risk <= 20) return "brightgreen";
  if (risk <= 40) return "green";
  if (risk <= 60) return "yellow";
  if (risk <= 80) return "orange";
  return "red";
};

/**
 * Formats a Shields.io badge object for a repository.
 */
export const formatRepoBadge = (
  scores: RepositoryScores,
  options: RepoBadgeOptions = {},
): ShieldsBadgeData => {
  const metric = options.metric || "overall";
  let defaultLabel = "OSSIQ";
  let message = `${scores.overall}/100`;
  let color = getScoreColor(scores.overall);

  switch (metric) {
    case "velocity":
      defaultLabel = "OSS Velocity";
      message = `${scores.velocity ?? 0}/100`;
      color = getScoreColor(scores.velocity ?? 0);
      break;
    case "health":
      defaultLabel = "OSS Health";
      message = `${scores.health}/100`;
      color = getScoreColor(scores.health);
      break;
    case "activity":
      defaultLabel = "OSS Activity";
      message = `${scores.activity}/100`;
      color = getScoreColor(scores.activity);
      break;
    case "community":
      defaultLabel = "OSS Community";
      message = `${scores.community}/100`;
      color = getScoreColor(scores.community);
      break;
    case "impact":
      defaultLabel = "OSS Impact";
      message = `${scores.impact}/100`;
      color = getScoreColor(scores.impact);
      break;
    case "risk":
      defaultLabel = "OSS Risk";
      message = `${scores.risk}/100`;
      color = getRiskScoreColor(scores.risk);
      break;
    default:
      defaultLabel = "OSSIQ";
      message = `${scores.overall}/100`;
      color = getScoreColor(scores.overall);
      break;
  }

  return createShieldsBadge(defaultLabel, message, color, options);
};

/**
 * Formats a Shields.io badge object for a user or organization.
 */
export const formatUserBadge = (
  scores: IdentityScores,
  options: UserBadgeOptions = {},
): ShieldsBadgeData => {
  const metric = options.metric || "overall";
  let defaultLabel = "OSSIQ";
  let message = `${scores.overall}/100`;
  let color = getScoreColor(scores.overall);

  switch (metric) {
    case "maintainer":
      defaultLabel = "OSS Maintainer";
      message = `${scores.maintainer}/100`;
      color = getScoreColor(scores.maintainer);
      break;
    case "contributor":
      defaultLabel = "OSS Contributor";
      message = `${scores.contributor}/100`;
      color = getScoreColor(scores.contributor);
      break;
    case "influence":
      defaultLabel = "OSS Influence";
      message = `${scores.influence}/100`;
      color = getScoreColor(scores.influence);
      break;
    default:
      defaultLabel = "OSSIQ";
      message = `${scores.overall}/100`;
      color = getScoreColor(scores.overall);
      break;
  }

  return createShieldsBadge(defaultLabel, message, color, options);
};

/**
 * Maps raw API repository data to calculated RepositoryScores.
 */
export const calculateRepoScoreFromRaw = (raw: {
  repository: NormalizedRepository;
  contributors: NormalizedContributor[];
  releases: NormalizedRelease[];
  languages: NormalizedLanguage[];
  packageManifests?: PackageManifest[];
  npmPackages?: NormalizedNpmPackage[];
  packageVelocities?: PackageVelocity[];
}): RepositoryScores => {
  return calculateRepositoryScore({
    repository: raw.repository,
    contributors: raw.contributors,
    releases: raw.releases,
    languages: raw.languages,
    packageManifests: raw.packageManifests,
    npmPackages: raw.npmPackages,
    packageVelocities: raw.packageVelocities,
  });
};

/**
 * Retrieves repository metrics from cache/API and formats as a Shields.io badge.
 */
export const getRepoBadge = async (
  owner: string,
  repo: string,
  options: RepoBadgeOptions = {},
): Promise<ShieldsBadgeData> => {
  const token =
    process.env.GITHUB_BADGES_SYNC_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT;
  const raw = await getCachedRepositoryData(owner, repo, { token });
  const scores = calculateRepoScoreFromRaw(raw);
  return formatRepoBadge(scores, options);
};

/**
 * Retrieves developer metrics from cache/API and formats as a Shields.io badge.
 */
export const getUserBadge = async (
  username: string,
  options: UserBadgeOptions = {},
): Promise<ShieldsBadgeData> => {
  const token =
    process.env.GITHUB_BADGES_SYNC_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT;
  const raw = await getCachedDeveloperData(username, 10, { token });

  const scores = calculateIdentityScore({
    repositories: raw.repositories,
    externalContributions: raw.externalContributions,
    organizations: raw.metadata.organizations,
  });

  return formatUserBadge(scores, options);
};

export interface SyncBadgeOptions {
  repoOwner?: string; // defaults to process.env.GITHUB_BADGES_OWNER || "ossintel"
  repoName?: string; // defaults to process.env.GITHUB_BADGES_REPO || "badges"
  branch?: string; // defaults to process.env.GITHUB_BADGES_BRANCH || undefined (default branch)
  filePath: string; // e.g. "repo/owner/repo.json"
  badgeData: ShieldsBadgeData;
  commitMessage?: string;
}

/**
 * Writes or updates the tiny JSON badge file directly in the GitHub App repository.
 * Zero-infrastructure hosting via GitHub Raw CDN.
 */
export const syncBadgeToGithubAppRepo = async ({
  repoOwner = process.env.GITHUB_BADGES_OWNER || "ossintel",
  repoName = process.env.GITHUB_BADGES_REPO || "badges",
  branch = process.env.GITHUB_BADGES_BRANCH || undefined,
  filePath,
  badgeData,
  commitMessage,
}: SyncBadgeOptions): Promise<boolean> => {
  const cleanPath = filePath.replace(/^\/+/, "");
  const jsonContent = `${JSON.stringify(badgeData, null, 2)}\n`;

  const token =
    process.env.GITHUB_BADGES_SYNC_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT;

  if (!token) {
    console.warn(
      `[Badges] Skipping GitHub repo sync for ${cleanPath}: No sync token found. Set GITHUB_BADGES_SYNC_TOKEN (or GITHUB_TOKEN / GITHUB_PAT).`,
    );
    return false;
  }

  try {
    const octokit = new Octokit({ auth: token });
    let existingSha: string | undefined;

    try {
      const { data: existing } = await octokit.rest.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: cleanPath,
        ...(branch ? { ref: branch } : {}),
      });

      if (
        !Array.isArray(existing) &&
        "sha" in existing &&
        "content" in existing
      ) {
        existingSha = existing.sha;
        const currentContent = Buffer.from(existing.content, "base64").toString(
          "utf-8",
        );
        // Idempotency: skip write if content is unchanged
        if (currentContent.trim() === jsonContent.trim()) {
          console.log(
            `[Badges] File ${cleanPath} already up to date in ${repoOwner}/${repoName}.`,
          );
          return true;
        }
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status !== 404) {
        console.warn(
          `[Badges] Could not inspect ${cleanPath} in ${repoOwner}/${repoName}:`,
          err,
        );
      }
    }

    const message =
      commitMessage ||
      `chore(badges): update ${cleanPath} for ${badgeData.label} [skip ci]`;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: cleanPath,
      message,
      content: Buffer.from(jsonContent).toString("base64"),
      sha: existingSha,
      ...(branch ? { branch } : {}),
    });

    console.log(
      `[Badges] Successfully committed ${cleanPath} to ${repoOwner}/${repoName}${branch ? `@${branch}` : ""}`,
    );
    return true;
  } catch (error) {
    console.error(
      `[Badges] Failed to commit ${cleanPath} to ${repoOwner}/${repoName}:`,
      error,
    );
    return false;
  }
};

/**
 * Sync repo overall badge to ossintel/badges repo
 */
export const syncRepoBadgeBackground = async (
  owner: string,
  repo: string,
  scores: RepositoryScores,
): Promise<boolean> => {
  const badgeData = formatRepoBadge(scores, { metric: "overall" });
  return await syncBadgeToGithubAppRepo({
    filePath: `repo/${owner.toLowerCase()}/${repo.toLowerCase()}.json`,
    badgeData,
  });
};

/**
 * Sync user overall badge to ossintel/badges repo
 */
export const syncUserBadgeBackground = async (
  username: string,
  scores: IdentityScores,
): Promise<boolean> => {
  const badgeData = formatUserBadge(scores, { metric: "overall" });
  return await syncBadgeToGithubAppRepo({
    filePath: `user/${username.toLowerCase()}.json`,
    badgeData,
  });
};
