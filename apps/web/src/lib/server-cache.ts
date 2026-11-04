import {
  fetchContributors,
  fetchDeveloper,
  fetchExternalContributions,
  fetchLanguages,
  fetchOrganization,
  fetchOrganizations,
  fetchReleases,
  fetchRepositories,
  fetchRepository,
  type NormalizedContribution,
  type NormalizedContributor,
  type NormalizedLanguage,
  type NormalizedRelease,
  suggestLinkedIdentities,
} from "@ossintel/github-normalizer";
import {
  type NormalizedOssintelConfig,
  normalizeOssintelConfig,
  type PackageManifest,
  shouldExcludeRepo,
  shouldIgnoreLanguage,
} from "@ossintel/input-parser";
import type { NormalizedNpmPackage } from "@ossintel/npm";
import type { PackageVelocity } from "@ossintel/scoring";
import { revalidateTag, unstable_cache } from "next/cache";
import { formatOrgResponse, formatUserResponse } from "./api-helpers";
import {
  AUTO_UPDATE_THRESHOLD_MS,
  BACKEND_CACHE_VERSION,
  CACHE_SAFETY_NET_TTL,
  GITHUB_APP_PAGE_SIZE,
} from "./constants-backend";
import { fetchRepoPackages } from "./repo-packages";

interface FetchOptions {
  token?: string;
}

interface CacheContainer<T> {
  data: T;
  fetchedAt: number;
  version: number;
}

/** Generic Cache-Aside with Stale-While-Revalidate resolution helper */
const resolveCachedData = async <T>(
  cacheTag: string,
  forceRefresh: boolean,
  fetchRaw: () => Promise<T>,
  wrapped: () => Promise<CacheContainer<T>>,
  logError: (err: unknown) => void,
): Promise<T & { cachedAt: number }> => {
  if (forceRefresh) {
    const fresh = await fetchRaw();
    revalidateTag(cacheTag, { expire: 0 });
    await wrapped();
    return {
      ...fresh,
      cachedAt: Date.now(),
    };
  }

  const cached = await wrapped();
  const isWrongVersion = cached.version !== BACKEND_CACHE_VERSION;

  if (isWrongVersion) {
    const fresh = await fetchRaw();
    revalidateTag(cacheTag, { expire: 0 });
    await wrapped();
    return {
      ...fresh,
      cachedAt: Date.now(),
    };
  }

  const isStale = Date.now() - cached.fetchedAt > AUTO_UPDATE_THRESHOLD_MS;

  if (isStale) {
    (async () => {
      try {
        await fetchRaw();
        revalidateTag(cacheTag, { expire: 0 });
        await wrapped();
      } catch (err) {
        logError(err);
      }
    })();
  }

  return {
    ...cached.data,
    cachedAt: cached.fetchedAt,
  };
};

// ----------------------------------------------------
// 0. OSSINTEL CONFIG DISCOVERY
// ----------------------------------------------------

/**
 * Fetches and normalizes .ossintel.json from a GitHub repository if present.
 */
export const fetchRepoOssintelConfig = async (
  owner: string,
  repo: string,
  options?: FetchOptions,
): Promise<NormalizedOssintelConfig | null> => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "OSSIntel-App",
    };
    if (options?.token) {
      headers.Authorization = `token ${options.token}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/.ossintel.json`,
      {
        headers,
        signal: AbortSignal.timeout(4000),
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    let rawText = "";
    if (data.content && data.encoding === "base64") {
      rawText = Buffer.from(data.content, "base64").toString("utf-8");
    } else if (typeof data === "string") {
      rawText = data;
    }

    if (!rawText) return null;
    const parsed = JSON.parse(rawText);
    return normalizeOssintelConfig(parsed);
  } catch {
    return null;
  }
};

/**
 * Discovers and parses .ossintel.json for a user/developer profile.
 * Checks ${username}/.github first, then ${username}/${username}.
 */
export const fetchUserOssintelConfig = async (
  username: string,
  options?: FetchOptions,
): Promise<NormalizedOssintelConfig | null> => {
  const fromDotGithub = await fetchRepoOssintelConfig(
    username,
    ".github",
    options,
  );
  if (fromDotGithub) return fromDotGithub;

  return await fetchRepoOssintelConfig(username, username, options);
};

// ----------------------------------------------------
// 1. DEVELOPER DATA CACHE
// ----------------------------------------------------

const fetchDeveloperDataRaw = async (
  username: string,
  limit: number,
  options: FetchOptions,
) => {
  const developer = await fetchDeveloper(username, options);
  let personalRepos = await fetchRepositories(username, {
    ...options,
    allPages: true,
    perPage: GITHUB_APP_PAGE_SIZE,
  });
  let organizations = await fetchOrganizations(username, options);
  let externalContributions: NormalizedContribution[] = [];
  try {
    externalContributions = await fetchExternalContributions(
      username,
      limit,
      options,
    );
  } catch (e) {
    console.error("Failed to fetch external contributions in server-cache", e);
  }

  let readme = "";
  try {
    const readmeRes = await fetch(
      `https://api.github.com/repos/${username}/${username}/readme`,
      {
        headers: options.token
          ? { Authorization: `token ${options.token}` }
          : {},
      },
    );
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      if (readmeData.content && readmeData.encoding === "base64") {
        readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
      }
    }
  } catch (e) {
    console.error("Failed to fetch readme in server-cache", e);
  }

  let config: NormalizedOssintelConfig | null = null;
  try {
    config = await fetchUserOssintelConfig(username, options);
  } catch (e) {
    console.error("Failed to fetch user .ossintel.json in server-cache", e);
  }

  if (config) {
    const userConfig = config;
    // 1. Filter out excluded organizations
    if (userConfig.profile.orgs.exclude.length > 0) {
      const excludedOrgs = new Set(
        userConfig.profile.orgs.exclude.map((o) => o.org.toLowerCase()),
      );
      organizations = organizations.filter(
        (org) => !excludedOrgs.has(org.login.toLowerCase()),
      );
    }

    // 2. Prioritize organizations
    if (userConfig.profile.orgs.priority.length > 0) {
      const priorityOrder = userConfig.profile.orgs.priority.map((o) =>
        o.org.toLowerCase(),
      );
      organizations.sort((a, b) => {
        const indexA = priorityOrder.indexOf(a.login.toLowerCase());
        const indexB = priorityOrder.indexOf(b.login.toLowerCase());
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }

    // 3. Filter out excluded repositories
    if (userConfig.profile.repositories.exclude.length > 0) {
      personalRepos = personalRepos.filter(
        (repo) => !shouldExcludeRepo(repo.fullName || repo.name, userConfig),
      );
    }

    // 4. Pin repositories (sort pinned to top)
    if (userConfig.profile.repositories.pinned.length > 0) {
      const pinnedNames = userConfig.profile.repositories.pinned.map((p) =>
        p.repo.toLowerCase(),
      );
      personalRepos.sort((a, b) => {
        const aFull = (a.fullName || a.name).toLowerCase();
        const bFull = (b.fullName || b.name).toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const isAPinned =
          pinnedNames.includes(aFull) || pinnedNames.includes(aName);
        const isBPinned =
          pinnedNames.includes(bFull) || pinnedNames.includes(bName);
        if (isAPinned && !isBPinned) return -1;
        if (!isAPinned && isBPinned) return 1;
        return 0;
      });
    }
  }

  const suggestions = suggestLinkedIdentities(developer, personalRepos);
  return formatUserResponse(
    developer,
    personalRepos,
    organizations,
    externalContributions,
    suggestions,
    readme,
    config,
  );
};

export const getCachedDeveloperData = async (
  username: string,
  limit: number,
  options: FetchOptions,
  forceRefresh = false,
) => {
  const cacheTag = `github:user:${username.toLowerCase()}`;

  const wrapped = unstable_cache(
    async () => {
      const data = await fetchDeveloperDataRaw(username, limit, options);
      return {
        data,
        fetchedAt: Date.now(),
        version: BACKEND_CACHE_VERSION,
      };
    },
    [`github-user-${username.toLowerCase()}-${limit}`],
    {
      revalidate: CACHE_SAFETY_NET_TTL,
      tags: [cacheTag],
    },
  );

  return resolveCachedData(
    cacheTag,
    forceRefresh,
    () => fetchDeveloperDataRaw(username, limit, options),
    wrapped,
    (err) =>
      console.error(
        `Auto-update failed for user ${username}, serving stale cache`,
        err,
      ),
  );
};

// ----------------------------------------------------
// 2. ORGANIZATION DATA CACHE
// ----------------------------------------------------

const fetchOrganizationDataRaw = async (
  login: string,
  options: FetchOptions,
) => {
  const org = await fetchOrganization(login, options);
  const repositories = await fetchRepositories(login, {
    ...options,
    allPages: true,
    perPage: GITHUB_APP_PAGE_SIZE,
  });
  return formatOrgResponse(org, repositories);
};

export const getCachedOrganizationData = async (
  login: string,
  options: FetchOptions,
  forceRefresh = false,
) => {
  const cacheTag = `github:org:${login.toLowerCase()}`;

  const wrapped = unstable_cache(
    async () => {
      const data = await fetchOrganizationDataRaw(login, options);
      return {
        data,
        fetchedAt: Date.now(),
        version: BACKEND_CACHE_VERSION,
      };
    },
    [`github-org-${login.toLowerCase()}`],
    {
      revalidate: CACHE_SAFETY_NET_TTL,
      tags: [cacheTag],
    },
  );

  return resolveCachedData(
    cacheTag,
    forceRefresh,
    () => fetchOrganizationDataRaw(login, options),
    wrapped,
    (err) =>
      console.error(
        `Auto-update failed for org ${login}, serving stale cache`,
        err,
      ),
  );
};

// ----------------------------------------------------
// 3. REPOSITORY DATA CACHE
// ----------------------------------------------------

const fetchRepositoryDataRaw = async (
  owner: string,
  repo: string,
  options: FetchOptions,
) => {
  const repository = await fetchRepository(owner, repo, options);

  let contributors: NormalizedContributor[] = [];
  try {
    contributors = await fetchContributors(owner, repo, options);
  } catch (e) {
    console.error("Failed to fetch contributors in server-cache", e);
  }

  let releases: NormalizedRelease[] = [];
  try {
    releases = await fetchReleases(owner, repo, options);
  } catch (e) {
    console.error("Failed to fetch releases in server-cache", e);
  }

  let languages: NormalizedLanguage[] = [];
  try {
    languages = await fetchLanguages(owner, repo, options);
  } catch (e) {
    console.error("Failed to fetch languages in server-cache", e);
  }

  let config: NormalizedOssintelConfig | null = null;
  try {
    config = await fetchRepoOssintelConfig(owner, repo, options);
  } catch (e) {
    console.error("Failed to fetch repo .ossintel.json in server-cache", e);
  }

  if (config) {
    const repoConfig = config;
    languages = languages.filter(
      (lang) => !shouldIgnoreLanguage(lang.name, repoConfig),
    );
    if (repoConfig.telemetry.languages.primaryOverride) {
      repository.language = repoConfig.telemetry.languages.primaryOverride;
    }
  }

  let packageManifests: PackageManifest[] = [];
  let npmPackages: NormalizedNpmPackage[] = [];
  let packageVelocities: PackageVelocity[] = [];

  try {
    const pkgData = await fetchRepoPackages(
      owner,
      repo,
      repository.defaultBranch || "main",
      options,
      config,
    );
    packageManifests = pkgData.manifests;
    npmPackages = pkgData.npmPackages;
    packageVelocities = pkgData.packageVelocities;
  } catch (e) {
    console.error("Failed to fetch repo packages in server-cache", e);
  }

  return {
    repository,
    contributors,
    releases,
    languages,
    packageManifests,
    npmPackages,
    packageVelocities,
    config,
  };
};

export const getCachedRepositoryData = async (
  owner: string,
  repo: string,
  options: FetchOptions,
  forceRefresh = false,
) => {
  const key = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const cacheTag = `github:repo:${key}`;

  const wrapped = unstable_cache(
    async () => {
      const data = await fetchRepositoryDataRaw(owner, repo, options);
      return {
        data,
        fetchedAt: Date.now(),
        version: BACKEND_CACHE_VERSION,
      };
    },
    [`github-repo-${key}`],
    {
      revalidate: CACHE_SAFETY_NET_TTL,
      tags: [cacheTag],
    },
  );

  return resolveCachedData(
    cacheTag,
    forceRefresh,
    () => fetchRepositoryDataRaw(owner, repo, options),
    wrapped,
    (err) =>
      console.error(
        `Auto-update failed for repo ${key}, serving stale cache`,
        err,
      ),
  );
};
