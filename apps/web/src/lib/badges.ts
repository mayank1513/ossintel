import {
  calculateIdentityScore,
  calculateRepositoryScore,
  type IdentityScores,
  type RepositoryScores,
} from "@ossintel/scoring";
import { Octokit } from "octokit";
import { getInstallationToken } from "./github-app";
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
  let defaultLabel = "OSSIntel Alpha";
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
      defaultLabel = "OSSIntel Alpha";
      message = `${scores.overall}/100`;
      color = getScoreColor(scores.overall);
      break;
  }

  const badge: ShieldsBadgeData = {
    schemaVersion: 1,
    label: options.label || defaultLabel,
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

/**
 * Formats a Shields.io badge object for a user or organization.
 */
export const formatUserBadge = (
  scores: IdentityScores,
  options: UserBadgeOptions = {},
): ShieldsBadgeData => {
  const metric = options.metric || "overall";
  let defaultLabel = "OSSIntel OSSIQ";
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
      defaultLabel = "OSSIntel OSSIQ";
      message = `${scores.overall}/100`;
      color = getScoreColor(scores.overall);
      break;
  }

  const badge: ShieldsBadgeData = {
    schemaVersion: 1,
    label: options.label || defaultLabel,
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

/**
 * Retrieves repository metrics from cache/API and formats as a Shields.io badge.
 */
export const getRepoBadge = async (
  owner: string,
  repo: string,
  options: RepoBadgeOptions = {},
): Promise<ShieldsBadgeData> => {
  const token = await getInstallationToken(owner);
  const raw = await getCachedRepositoryData(owner, repo, { token });

  const scores = calculateRepositoryScore({
    repository: raw.repository,
    contributors: raw.contributors,
    releases: raw.releases,
    languages: raw.languages,
    packageManifests: raw.packageManifests,
    npmPackages: raw.npmPackages,
    packageVelocities: raw.packageVelocities,
  });

  return formatRepoBadge(scores, options);
};

/**
 * Retrieves developer metrics from cache/API and formats as a Shields.io badge.
 */
export const getUserBadge = async (
  username: string,
  options: UserBadgeOptions = {},
): Promise<ShieldsBadgeData> => {
  const token = await getInstallationToken(username);
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
  branch?: string; // defaults to process.env.GITHUB_BADGES_BRANCH || "main"
  filePath: string; // e.g. "badges/repo/owner/repo.json"
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
  branch = process.env.GITHUB_BADGES_BRANCH || "main",
  filePath,
  badgeData,
  commitMessage,
}: SyncBadgeOptions): Promise<boolean> => {
  const jsonContent = `${JSON.stringify(badgeData, null, 2)}\n`;

  // Resolve token: Try GitHub App installation token for the repoOwner
  let token = await getInstallationToken(repoOwner);
  if (!token) {
    token = process.env.GITHUB_TOKEN;
  }

  if (!token) {
    console.warn(
      `[Badges] Skipping GitHub repo sync for ${filePath}: No GitHub App or PAT token found.`,
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
        path: filePath,
        ref: branch,
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
            `[Badges] File ${filePath} already up to date in ${repoOwner}/${repoName}.`,
          );
          return true;
        }
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status !== 404) {
        console.warn(
          `[Badges] Could not inspect ${filePath} in ${repoOwner}/${repoName}:`,
          err,
        );
      }
    }

    const message =
      commitMessage ||
      `chore(badges): update ${filePath} for ${badgeData.label} [skip ci]`;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      message,
      content: Buffer.from(jsonContent).toString("base64"),
      sha: existingSha,
      branch,
    });

    console.log(
      `[Badges] Successfully committed ${filePath} to ${repoOwner}/${repoName}@${branch}`,
    );
    return true;
  } catch (error) {
    console.error(
      `[Badges] Failed to commit ${filePath} to ${repoOwner}/${repoName}:`,
      error,
    );
    return false;
  }
};
