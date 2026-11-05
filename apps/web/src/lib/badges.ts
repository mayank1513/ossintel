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

export const getScoreHexColor = (score: number): string => {
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#eab308";
  if (score >= 30) return "#f59e0b";
  return "#ef4444";
};

export const OSSINTEL_EYE_LOGO_BASE64 =
  "data:image/png;base64,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";

export const generateOSSIQBadgeSvg = ({
  score,
  theme = "dark",
}: {
  score: number;
  theme?: "dark" | "light";
}): string => {
  const isLight = theme === "light";
  const leftBg = isLight ? "#ffffff" : "#18181b";
  const rightBg = getScoreHexColor(score);
  const strokeColor = isLight ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.18)";
  const ossFill = isLight ? "#0f172a" : "#ffffff";
  const iqFill = isLight ? "#059669" : "#34d399";
  const message = `${score}/100`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="138" height="20" role="img" aria-label="OSSIQ: ${message}">
  <title>OSSIQ: ${message}</title>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity="${isLight ? ".12" : ".15"}"/>
    <stop offset="1" stop-opacity="${isLight ? ".08" : ".1"}"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="138" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <rect width="78" height="20" fill="${leftBg}"/>
    <rect x="78" width="60" height="20" fill="${rightBg}"/>
    <rect width="138" height="20" fill="url(#b)"/>
    <rect width="138" height="20" rx="3" fill="none" stroke="${strokeColor}" stroke-width="1"/>
  </g>
  <image x="2" y="-3" width="26" height="26" href="${OSSINTEL_EYE_LOGO_BASE64}"/>
  <g aria-hidden="true" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" font-weight="bold">
    ${!isLight ? `<text x="31" y="15" fill="#010101" fill-opacity=".4"><tspan fill="#010101">OSS</tspan><tspan fill="#010101">IQ</tspan></text>` : ""}
    <text x="31" y="14"><tspan fill="${ossFill}">OSS</tspan><tspan fill="${iqFill}">IQ</tspan></text>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" font-weight="bold">
    <text aria-hidden="true" x="108" y="15" fill="#010101" fill-opacity=".35">${message}</text>
    <text x="108" y="14">${message}</text>
  </g>
</svg>`;
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

export interface SyncFileOptions {
  repoOwner?: string; // defaults to process.env.GITHUB_BADGES_OWNER || "ossintel"
  repoName?: string; // defaults to process.env.GITHUB_BADGES_REPO || "badges"
  branch?: string; // defaults to process.env.GITHUB_BADGES_BRANCH || undefined (default branch)
  filePath: string;
  content: string;
  commitMessage?: string;
}

export interface SyncBadgeOptions {
  repoOwner?: string; // defaults to process.env.GITHUB_BADGES_OWNER || "ossintel"
  repoName?: string; // defaults to process.env.GITHUB_BADGES_REPO || "badges"
  branch?: string; // defaults to process.env.GITHUB_BADGES_BRANCH || undefined (default branch)
  filePath: string; // e.g. "repo/owner/repo.json"
  badgeData: ShieldsBadgeData;
  commitMessage?: string;
}

/**
 * Writes or updates any file directly in the GitHub App repository.
 * Zero-infrastructure hosting via GitHub Raw CDN.
 */
export const syncFileToGithubAppRepo = async ({
  repoOwner = process.env.GITHUB_BADGES_OWNER || "ossintel",
  repoName = process.env.GITHUB_BADGES_REPO || "badges",
  branch = process.env.GITHUB_BADGES_BRANCH || undefined,
  filePath,
  content,
  commitMessage,
}: SyncFileOptions): Promise<boolean> => {
  const cleanPath = filePath.replace(/^\/+/, "");

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
        if (currentContent.trim() === content.trim()) {
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
      commitMessage || `chore(badges): update ${cleanPath} [skip ci]`;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: cleanPath,
      message,
      content: Buffer.from(content).toString("base64"),
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
 * Writes or updates the tiny JSON badge file directly in the GitHub App repository.
 * Zero-infrastructure hosting via GitHub Raw CDN.
 */
export const syncBadgeToGithubAppRepo = async ({
  repoOwner,
  repoName,
  branch,
  filePath,
  badgeData,
  commitMessage,
}: SyncBadgeOptions): Promise<boolean> => {
  const jsonContent = `${JSON.stringify(badgeData, null, 2)}\n`;
  return await syncFileToGithubAppRepo({
    repoOwner,
    repoName,
    branch,
    filePath,
    content: jsonContent,
    commitMessage:
      commitMessage ||
      `chore(badges): update ${filePath.replace(/^\/+/, "")} for ${badgeData.label} [skip ci]`,
  });
};

/**
 * Sync repo overall badge (JSON, dark SVG, light SVG) to ossintel/badges repo
 */
export const syncRepoBadgeBackground = async (
  owner: string,
  repo: string,
  scores: RepositoryScores,
): Promise<boolean> => {
  const badgeData = formatRepoBadge(scores, { metric: "overall" });
  const darkSvg = generateOSSIQBadgeSvg({
    score: scores.overall,
    theme: "dark",
  });
  const lightSvg = generateOSSIQBadgeSvg({
    score: scores.overall,
    theme: "light",
  });
  const cleanOwner = owner.toLowerCase();
  const cleanRepo = repo.toLowerCase();

  const [jsonOk, darkOk, lightOk] = await Promise.all([
    syncFileToGithubAppRepo({
      filePath: `repo/${cleanOwner}/${cleanRepo}.json`,
      content: `${JSON.stringify(badgeData, null, 2)}\n`,
    }),
    syncFileToGithubAppRepo({
      filePath: `repo/${cleanOwner}/${cleanRepo}.svg`,
      content: darkSvg,
    }),
    syncFileToGithubAppRepo({
      filePath: `repo/${cleanOwner}/${cleanRepo}-light.svg`,
      content: lightSvg,
    }),
  ]);

  return jsonOk && darkOk && lightOk;
};

/**
 * Sync user overall badge (JSON, dark SVG, light SVG) to ossintel/badges repo
 */
export const syncUserBadgeBackground = async (
  username: string,
  scores: IdentityScores,
): Promise<boolean> => {
  const badgeData = formatUserBadge(scores, { metric: "overall" });
  const darkSvg = generateOSSIQBadgeSvg({
    score: scores.overall,
    theme: "dark",
  });
  const lightSvg = generateOSSIQBadgeSvg({
    score: scores.overall,
    theme: "light",
  });
  const cleanUser = username.toLowerCase();

  const [jsonOk, darkOk, lightOk] = await Promise.all([
    syncFileToGithubAppRepo({
      filePath: `user/${cleanUser}.json`,
      content: `${JSON.stringify(badgeData, null, 2)}\n`,
    }),
    syncFileToGithubAppRepo({
      filePath: `user/${cleanUser}.svg`,
      content: darkSvg,
    }),
    syncFileToGithubAppRepo({
      filePath: `user/${cleanUser}-light.svg`,
      content: lightSvg,
    }),
  ]);

  return jsonOk && darkOk && lightOk;
};
