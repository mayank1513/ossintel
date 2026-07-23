import type { NormalizedContribution } from "@ossintel/github-normalizer";
import type { NormalizedNpmUser } from "@ossintel/npm";
import type { NormalizedStackOverflowUser } from "@ossintel/stackoverflow";
import {
  BADGE_DOWNLOADS_1M,
  BADGE_FRAMEWORK_STARS,
  BADGE_PRODIGIOUS_PRS,
  BADGE_SO_ACCEPTANCE_MIN_ANSWERS,
  BADGE_SO_ACCEPTANCE_RATE,
  BADGE_SO_ANSWERS,
  BADGE_SO_REP,
  BADGE_STARS_1K,
  BADGE_TEST_PRS,
} from "./constants";

interface BadgeInputs {
  externalContributions: NormalizedContribution[];
  activeOrgsCount: number;
  totalStarsCount: number;
  totalNpmDownloads: number;
  npmUser?: NormalizedNpmUser | null;
  stackoverflowUser?: NormalizedStackOverflowUser | null;
}

/** Compute achievement badges based on cross-platform activity. */
export const calculateBadges = (inputs: BadgeInputs): string[] => {
  const {
    externalContributions,
    activeOrgsCount,
    totalStarsCount,
    totalNpmDownloads,
    npmUser,
    stackoverflowUser,
  } = inputs;

  const badges: string[] = [];
  const soRep = stackoverflowUser?.reputation ?? 0;
  const totalPRsCount = externalContributions.length;

  const contributedToCore = externalContributions.some(
    (c) => c.targetRepoStars >= BADGE_FRAMEWORK_STARS,
  );
  if (contributedToCore) {
    badges.push("Framework Contributor");
  }
  if (activeOrgsCount >= 1) {
    badges.push("OSS Founder");
  }
  if (npmUser?.packages && npmUser.packages.length >= 1) {
    badges.push("Package Publisher");
  }
  if (soRep >= BADGE_SO_REP) {
    badges.push("StackOverflow Elite");
  }
  if (stackoverflowUser && stackoverflowUser.answerCount >= BADGE_SO_ANSWERS) {
    badges.push("Community Helper");
  }
  if (
    stackoverflowUser &&
    stackoverflowUser.acceptanceRate >= BADGE_SO_ACCEPTANCE_RATE &&
    stackoverflowUser.answerCount >= BADGE_SO_ACCEPTANCE_MIN_ANSWERS
  ) {
    badges.push("High Acceptance");
  }

  const testPRsCount = externalContributions.filter(
    (c) => c.type === "test",
  ).length;
  if (testPRsCount >= BADGE_TEST_PRS) {
    badges.push("Test Champion");
  }
  const securityPR = externalContributions.some((c) =>
    /\b(security|vuln|cve|fix|patch)\b/i.test(c.title),
  );
  if (securityPR) {
    badges.push("Security Champion");
  }
  if (totalPRsCount >= BADGE_PRODIGIOUS_PRS) {
    badges.push("Prodigious Contributor");
  }
  if (totalStarsCount >= BADGE_STARS_1K) {
    badges.push("1k Stars Earned");
  }
  if (totalNpmDownloads >= BADGE_DOWNLOADS_1M) {
    badges.push("1M npm Downloads");
  }

  return badges;
};
