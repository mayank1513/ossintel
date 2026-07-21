"use client";

import type {
  NormalizedContribution,
  NormalizedOrganization,
  NormalizedRepository,
} from "@ossintel/github-normalizer";
import { generateIdentityInsights } from "@ossintel/insights";
import type { NormalizedNpmUser } from "@ossintel/npm";
import { calculateIdentityScore } from "@ossintel/scoring";
import type { NormalizedStackOverflowUser } from "@ossintel/stackoverflow";
import { useMemo } from "react";
import { mapRepositoryScores } from "../lib/audit";

interface DeveloperScoresProps {
  userRepos: NormalizedRepository[];
  orgsQueries: Array<{ data?: { repositories: NormalizedRepository[] } }>;
  includeUserRepos: boolean;
  npmUser: NormalizedNpmUser | null;
  stackoverflowUser: NormalizedStackOverflowUser | null;
  userLogin: string;
  userName: string;
  externalContributions?: NormalizedContribution[];
  organizations?: NormalizedOrganization[];
}

export const useDeveloperScores = ({
  userRepos,
  orgsQueries,
  includeUserRepos,
  npmUser,
  stackoverflowUser,
  userLogin,
  userName,
  externalContributions,
  organizations = [],
}: DeveloperScoresProps) => {
  return useMemo(() => {
    const orgRepos = orgsQueries
      .filter((q) => q.data)
      .flatMap((q) => q.data?.repositories || []);

    const combinedRepos = [...(includeUserRepos ? userRepos : []), ...orgRepos];

    const scores = calculateIdentityScore({
      repositories: combinedRepos,
      npmUser,
      stackoverflowUser,
      externalContributions,
      organizations,
    });

    const insightsResult = generateIdentityInsights(combinedRepos, scores, {
      type: "user",
      login: userLogin,
      name: userName,
      linkedIdentities: {
        npm: npmUser?.username || undefined,
        stackoverflow: stackoverflowUser?.userId || undefined,
      },
      npmUser,
      stackoverflowUser,
    });

    const repoScores = mapRepositoryScores(combinedRepos);

    const contribScores = (externalContributions || []).map((c) => {
      const starScore = Math.min(100, Math.log10(c.targetRepoStars + 1) * 20);
      return {
        repoName: c.repoFullName.split("/")[1] || c.repoFullName,
        fullName: c.repoFullName,
        scores: {
          overall: Math.round(starScore),
          risk: 10,
        },
        stars: c.targetRepoStars,
        forks: 0,
        isContribution: true,
        title: c.title,
        htmlUrl: c.htmlUrl,
        type: c.type,
      };
    });

    return {
      scores,
      findings: insightsResult.findings,
      recommendations: insightsResult.recommendations,
      promptContext: insightsResult.promptContext,
      repositories: repoScores,
      externalContributions: contribScores,
    };
  }, [
    userRepos,
    orgsQueries,
    includeUserRepos,
    npmUser,
    stackoverflowUser,
    userLogin,
    userName,
    externalContributions,
    organizations,
  ]);
};
