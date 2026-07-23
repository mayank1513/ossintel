import { calculateBadges } from "./badges";
import {
  CONFIDENCE_HIGH_DOWNLOADS,
  CONFIDENCE_HIGH_PRS,
  CONFIDENCE_HIGH_REPOS,
  CONFIDENCE_HIGH_SO_REP,
  CONFIDENCE_MEDIUM_PRS,
  CONFIDENCE_MEDIUM_REPOS,
  CONFIDENCE_MEDIUM_SO_REP,
  MAX_SCORE,
  OVERALL_NO_ORG_CONTRIBUTOR_WEIGHT,
  OVERALL_NO_ORG_INFLUENCE_WEIGHT,
  OVERALL_NO_ORG_MAINTAINER_WEIGHT,
  OVERALL_NPM_BONUS_WEIGHT,
  OVERALL_ORG_CONTRIBUTOR_WEIGHT,
  OVERALL_ORG_INFLUENCE_WEIGHT,
  OVERALL_ORG_LEADERSHIP_WEIGHT,
  OVERALL_ORG_MAINTAINER_WEIGHT,
  OVERALL_SO_BONUS_WEIGHT,
} from "./constants";
import { calculateContributorScore } from "./contributor-scoring";
import { generateEvidence, generateFactors } from "./evidence";
import { calculateInfluenceScore } from "./influence-scoring";
import { calculateKnowledgeScore } from "./knowledge-scoring";
import { calculateMaintainerScore } from "./maintainer-scoring";
import { calculateOrganizationScore } from "./organization-scoring";
import { calculatePublishingScore } from "./publishing-scoring";
import { calculateSkills } from "./skills";
import type { IdentityScores, IdentityScoringInputs } from "./types";

/**
 * Calculate the unified OSS identity score.
 *
 * GitHub is the primary identity (~80-85% weight). npm (Package Publishing)
 * and Stack Overflow (Knowledge Sharing) provide additive evidence bonuses
 * that can never reduce the score.
 *
 * @see {@link file://docs/domain-model.md} for scoring philosophy.
 */
export const calculateIdentityScore = (
  inputs: IdentityScoringInputs,
): IdentityScores => {
  const {
    repositories = [],
    npmUser = null,
    stackoverflowUser = null,
    externalContributions = [],
    organizations = [],
  } = inputs;

  const totalStarsCount = repositories.reduce(
    (acc, r) => acc + r.stargazersCount,
    0,
  );
  const totalForksCount = repositories.reduce(
    (acc, r) => acc + r.forksCount,
    0,
  );
  const totalNpmDownloads = npmUser?.totalWeeklyDownloads ?? 0;
  const soRep = stackoverflowUser?.reputation ?? 0;

  // Early exit: no data at all
  if (
    repositories.length === 0 &&
    externalContributions.length === 0 &&
    !npmUser &&
    !stackoverflowUser &&
    organizations.length === 0
  ) {
    return {
      overall: 0,
      maintainer: 0,
      contributor: 0,
      organization: 0,
      influence: 0,
      confidence: "Low",
      evidence: {
        maintainer: [],
        contributor: [],
        influence: [],
        organization: [],
      },
      factors: {
        maintainer: [],
        contributor: [],
        influence: [],
        organization: [],
      },
      badges: [],
      skills: [],
    };
  }

  // 1. Maintainer Score (GitHub-only weighting + additive npm bonus)
  const maintainerResult = calculateMaintainerScore(
    repositories,
    totalNpmDownloads,
  );

  // 2. Contributor Score (external PRs)
  const contributorResult = calculateContributorScore(externalContributions);

  // 3. Organization Leadership
  const orgResult = calculateOrganizationScore(organizations);

  // 4. Influence (GitHub base + additive bonuses)
  const influenceResult = calculateInfluenceScore(
    totalStarsCount,
    totalForksCount,
    totalNpmDownloads,
    soRep,
  );

  // 5. Confidence
  const totalReposCount = repositories.length;
  const totalPRsCount = externalContributions.length;
  let confidence: "High" | "Medium" | "Low" = "Low";
  if (
    totalReposCount >= CONFIDENCE_HIGH_REPOS ||
    totalPRsCount >= CONFIDENCE_HIGH_PRS ||
    totalNpmDownloads >= CONFIDENCE_HIGH_DOWNLOADS ||
    soRep >= CONFIDENCE_HIGH_SO_REP
  ) {
    confidence = "High";
  } else if (
    totalReposCount >= CONFIDENCE_MEDIUM_REPOS ||
    totalPRsCount >= CONFIDENCE_MEDIUM_PRS ||
    soRep >= CONFIDENCE_MEDIUM_SO_REP
  ) {
    confidence = "Medium";
  }

  // 6. Overall Reputation (GitHub-first + additive evidence bonuses)
  const githubMaintainer = maintainerResult.githubBase;
  const contributor = contributorResult.score;
  const organizationScore = orgResult.score;
  const githubInfluence = influenceResult.githubBase;

  let githubOverall = 0;
  if (orgResult.activeCount > 0) {
    githubOverall = Math.round(
      githubMaintainer * OVERALL_ORG_MAINTAINER_WEIGHT +
        contributor * OVERALL_ORG_CONTRIBUTOR_WEIGHT +
        organizationScore * OVERALL_ORG_LEADERSHIP_WEIGHT +
        githubInfluence * OVERALL_ORG_INFLUENCE_WEIGHT,
    );
  } else {
    githubOverall = Math.round(
      githubMaintainer * OVERALL_NO_ORG_MAINTAINER_WEIGHT +
        contributor * OVERALL_NO_ORG_CONTRIBUTOR_WEIGHT +
        githubInfluence * OVERALL_NO_ORG_INFLUENCE_WEIGHT,
    );
  }

  // Capability-specific scores (0-100 each)
  const publishingResult = calculatePublishingScore(npmUser);
  const knowledgeResult = calculateKnowledgeScore(stackoverflowUser);

  // Additive bonuses using scaling factor (lower GitHub scores get larger bonuses)
  const scalingFactor = 1 + (MAX_SCORE - githubOverall) / MAX_SCORE; // 1.0 to 2.0
  const npmWeight = OVERALL_NPM_BONUS_WEIGHT; // Max 8 points at scale 1.0 (max 16 at scale 2.0)
  const soWeight = OVERALL_SO_BONUS_WEIGHT; // Max 8 points at scale 1.0 (max 16 at scale 2.0)

  const npmBonus = publishingResult
    ? (publishingResult.score / MAX_SCORE) * npmWeight * scalingFactor
    : 0;
  const soBonus = knowledgeResult
    ? (knowledgeResult.score / MAX_SCORE) * soWeight * scalingFactor
    : 0;

  const overall = Math.min(
    MAX_SCORE,
    Math.round(githubOverall + npmBonus + soBonus),
  );

  // 7. Badges
  const activeRepos = repositories.filter((r) => !r.isArchived);
  const badges = calculateBadges({
    externalContributions,
    activeOrgsCount: orgResult.activeCount,
    totalStarsCount,
    totalNpmDownloads,
    npmUser,
    stackoverflowUser,
  });

  // 8. Evidence & Factors
  const evidenceInputs = {
    activeRepos,
    allRepos: repositories,
    externalContributions,
    organizations,
    contributorBreakdown: contributorResult.breakdown,
    maintainerScore: maintainerResult.score,
    sustainedCount: maintainerResult.sustainedCount,
    totalStarsCount,
    totalForksCount,
    totalNpmDownloads,
    soReputation: soRep,
    npmUser,
    stackoverflowUser,
  };

  const evidence = generateEvidence(evidenceInputs);
  const factors = generateFactors(evidenceInputs);

  // 9. Skills
  const skills = calculateSkills({
    repositories,
    externalContributions,
    npmUser,
    stackoverflowUser,
  });

  return {
    overall,
    maintainer: maintainerResult.score,
    contributor: contributorResult.score,
    organization: organizationScore,
    influence: influenceResult.score,
    confidence,
    evidence,
    factors,
    badges,
    skills,
  };
};
