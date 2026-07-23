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
import { revalidateTag, unstable_cache } from "next/cache";
import { formatOrgResponse, formatUserResponse } from "./api-helpers";
import {
  AUTO_UPDATE_THRESHOLD_MS,
  BACKEND_CACHE_VERSION,
  CACHE_SAFETY_NET_TTL,
  GITHUB_APP_PAGE_SIZE,
} from "./constants-backend";

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
// 1. DEVELOPER DATA CACHE
// ----------------------------------------------------

const fetchDeveloperDataRaw = async (
  username: string,
  limit: number,
  options: FetchOptions,
) => {
  const developer = await fetchDeveloper(username, options);
  const personalRepos = await fetchRepositories(username, {
    ...options,
    allPages: true,
    perPage: GITHUB_APP_PAGE_SIZE,
  });
  const organizations = await fetchOrganizations(username, options);
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

  const suggestions = suggestLinkedIdentities(developer, personalRepos);
  return formatUserResponse(
    developer,
    personalRepos,
    organizations,
    externalContributions,
    suggestions,
    readme,
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

  return {
    repository,
    contributors,
    releases,
    languages,
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
