import type { NormalizedContribution } from "@ossintel/github-normalizer";
import {
  CONTRIB_BASE_CAP_MULTIPLIER,
  CONTRIB_BASE_CAP_OFFSET,
  CONTRIB_BASE_POINTS_BONUS,
  CONTRIB_BASE_POINTS_MULTIPLIER,
  CONTRIB_IMPORTANCE_DIVISOR,
  CONTRIB_QUALITY_CHORE,
  CONTRIB_QUALITY_CODE,
  CONTRIB_QUALITY_DOCS,
  CONTRIB_QUALITY_TEST,
  CONTRIB_SUBSEQUENT_POINTS_BASE,
  CONTRIB_SUBSEQUENT_POINTS_FACTOR,
  MAX_SCORE,
} from "./constants";

export interface ContributorResult {
  /** Final contributor score (0-100). */
  score: number;
  /** Per-repo breakdown of earned points. */
  breakdown: Array<{ repo: string; points: number }>;
}

/**
 * Calculate the contributor pillar score from external (upstream) PRs.
 *
 * Quality-weighted scoring: PR type (code/docs/test/chore) and target
 * repository importance (star count) determine point allocation.
 */
export const calculateContributorScore = (
  externalContributions: NormalizedContribution[],
): ContributorResult => {
  const repoPRsMap: Record<
    string,
    {
      repoFullName: string;
      prs: NormalizedContribution[];
      stars: number;
    }
  > = {};

  for (const c of externalContributions) {
    if (!repoPRsMap[c.repoFullName]) {
      repoPRsMap[c.repoFullName] = {
        repoFullName: c.repoFullName,
        prs: [],
        stars: c.targetRepoStars || 0,
      };
    }
    repoPRsMap[c.repoFullName].prs.push(c);
  }

  let totalContributorPoints = 0;
  const breakdown: Array<{ repo: string; points: number }> = [];

  for (const repoName of Object.keys(repoPRsMap)) {
    const item = repoPRsMap[repoName];
    const { prs, stars } = item;

    const importance = Math.log10(stars + 1) / CONTRIB_IMPORTANCE_DIVISOR;
    const cap =
      CONTRIB_BASE_CAP_OFFSET +
      Math.round(Math.min(1.0, importance) * CONTRIB_BASE_CAP_MULTIPLIER);

    const sortedPRs = [...prs].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const firstPR = sortedPRs[0];
    let qualityMultiplier = CONTRIB_QUALITY_CODE;
    if (firstPR.type === "docs") qualityMultiplier = CONTRIB_QUALITY_DOCS;
    else if (firstPR.type === "test") qualityMultiplier = CONTRIB_QUALITY_TEST;
    else if (firstPR.type === "chore")
      qualityMultiplier = CONTRIB_QUALITY_CHORE;

    let basePoints =
      Math.min(1.0, importance) *
      qualityMultiplier *
      CONTRIB_BASE_POINTS_MULTIPLIER;
    basePoints =
      basePoints + Math.max(0, importance - 1.0) * CONTRIB_BASE_POINTS_BONUS;

    let subsequentPoints = 0;
    for (let i = 1; i < sortedPRs.length; i++) {
      const pr = sortedPRs[i];
      let subQual = CONTRIB_QUALITY_CODE;
      if (pr.type === "docs") subQual = CONTRIB_QUALITY_DOCS;
      else if (pr.type === "test") subQual = CONTRIB_QUALITY_TEST;
      else if (pr.type === "chore") subQual = CONTRIB_QUALITY_CHORE;
      subsequentPoints += subQual * CONTRIB_SUBSEQUENT_POINTS_BASE;
    }
    subsequentPoints = subsequentPoints * CONTRIB_SUBSEQUENT_POINTS_FACTOR;

    const repoPoints = Math.min(cap, Math.round(basePoints + subsequentPoints));
    totalContributorPoints += repoPoints;
    breakdown.push({ repo: repoName, points: repoPoints });
  }

  const score = Math.min(MAX_SCORE, totalContributorPoints);

  return { score, breakdown };
};
