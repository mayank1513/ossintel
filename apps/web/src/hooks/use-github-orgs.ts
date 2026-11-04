"use client";

import type {
  NormalizedContributor,
  NormalizedLanguage,
  NormalizedRelease,
  NormalizedRepository,
} from "@ossintel/github-normalizer";
import type {
  NormalizedOssintelConfig,
  PackageManifest,
} from "@ossintel/input-parser";
import type {
  Finding,
  PromptContext,
  Recommendation,
} from "@ossintel/insights";
import { generateInsights } from "@ossintel/insights";
import type { NormalizedNpmPackage } from "@ossintel/npm";
import type { PackageVelocity, RepositoryScores } from "@ossintel/scoring";
import { calculateRepositoryScore } from "@ossintel/scoring";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { fetchWithCache } from "@/lib/api-client";

export interface OrgResponse {
  type: "org";
  metadata: {
    login: string;
    name: string | null;
    avatarUrl: string;
    htmlUrl: string;
    location: string | null;
    email: string | null;
    blog: string | null;
    publicRepos: number;
    followers: number;
    description: string | null;
  };
  repositories: NormalizedRepository[];
  cachedAt?: number;
}

export interface RepoResponse {
  type: "repo";
  metadata: NormalizedRepository;
  scores: RepositoryScores;
  findings: Finding[];
  recommendations: Recommendation[];
  promptContext: PromptContext;
  languages: NormalizedLanguage[];
  contributorsCount: number;
  config?: NormalizedOssintelConfig;
}

const fetchOrgData = async (orgName: string, forceRefresh: boolean) => {
  return await fetchWithCache<OrgResponse>(
    `org:${orgName.toLowerCase()}`,
    "/api/github/org",
    {
      query: orgName,
    },
    forceRefresh,
  );
};

export const useGithubOrg = (orgName: string) => {
  const isRefreshingRef = useRef(false);

  const query = useQuery({
    queryKey: ["org", orgName?.toLowerCase()],
    queryFn: async () => {
      const forceRefresh = isRefreshingRef.current;
      try {
        return await fetchOrgData(orgName, forceRefresh);
      } finally {
        isRefreshingRef.current = false;
      }
    },
    enabled: !!orgName,
    retry: false,
  });

  const refresh = async () => {
    isRefreshingRef.current = true;
    await query.refetch();
  };

  return { ...query, refresh };
};

export const useGithubOrgs = (orgNames: string[]) => {
  const isRefreshingRef = useRef(false);

  const queries = useQueries({
    queries: orgNames.map((orgName) => ({
      queryKey: ["org", orgName.toLowerCase()],
      queryFn: () => {
        const forceRefresh = isRefreshingRef.current;
        return fetchOrgData(orgName, forceRefresh);
      },
      enabled: !!orgName,
      retry: false,
    })),
  });

  const refreshAll = async () => {
    isRefreshingRef.current = true;
    try {
      const queriesRefetch = queries.map((q) => q.refetch());
      await Promise.all(queriesRefetch);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  return {
    queries,
    isLoading: queries.some((q) => q.isLoading),
    isFetching: queries.some((q) => q.isFetching),
    error: queries.find((q) => q.error)?.error || null,
    refreshAll,
  };
};

export interface RepoRawResponse {
  repository: NormalizedRepository;
  contributors: NormalizedContributor[];
  releases: NormalizedRelease[];
  languages: NormalizedLanguage[];
  packageManifests?: PackageManifest[];
  npmPackages?: NormalizedNpmPackage[];
  packageVelocities?: PackageVelocity[];
  cachedAt?: number;
}

export const useGithubRepo = (owner: string, repo: string) => {
  const isRefreshingRef = useRef(false);

  const query = useQuery({
    queryKey: ["repo", owner?.toLowerCase(), repo?.toLowerCase()],
    queryFn: async () => {
      const forceRefresh = isRefreshingRef.current;
      try {
        const raw = await fetchWithCache<RepoRawResponse>(
          `repo:${owner.toLowerCase()}:${repo.toLowerCase()}`,
          "/api/github/repo",
          { owner, repo },
          forceRefresh,
        );
        const scores = calculateRepositoryScore({
          repository: raw.repository,
          contributors: raw.contributors,
          releases: raw.releases,
          languages: raw.languages,
          packageManifests: raw.packageManifests,
          npmPackages: raw.npmPackages,
          packageVelocities: raw.packageVelocities,
        });
        const insightsResult = generateInsights(
          {
            repository: raw.repository,
            releases: raw.releases,
            contributors: raw.contributors,
            languages: raw.languages,
          },
          scores,
        );
        return {
          type: "repo" as const,
          metadata: raw.repository,
          scores,
          findings: insightsResult.findings,
          recommendations: insightsResult.recommendations,
          promptContext: insightsResult.promptContext,
          languages: raw.languages,
          contributorsCount: raw.contributors.length,
          packages: raw.npmPackages ?? [],
          packageManifests: raw.packageManifests ?? [],
          cachedAt: raw.cachedAt,
        };
      } finally {
        isRefreshingRef.current = false;
      }
    },
    enabled: !!owner && !!repo,
    retry: false,
  });

  const refresh = async () => {
    isRefreshingRef.current = true;
    await query.refetch();
  };

  return { ...query, refresh };
};
