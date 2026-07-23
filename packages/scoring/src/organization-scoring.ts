import {
  MAX_SCORE,
  ORG_ACTIVE_COUNT_WEIGHT,
  ORG_LEADERSHIP_MULTIPLIER,
} from "./constants";
import type { IdentityScoringInputs } from "./types";

export interface OrganizationResult {
  /** Final organization leadership score (0-100). */
  score: number;
  /** Number of active organizations. */
  activeCount: number;
}

/** Calculate the organization leadership pillar score. */
export const calculateOrganizationScore = (
  organizations: NonNullable<IdentityScoringInputs["organizations"]>,
): OrganizationResult => {
  const activeOrgs = organizations.filter(
    (o) => (o.publicRepos || 0) > 0 || (o.followers || 0) > 0,
  );
  const activeCount = activeOrgs.length;

  let orgLeadershipSum = 0;
  for (const org of activeOrgs) {
    const orgStars = org.stars || 0;
    const orgFollowers = org.followers || 0;
    const orgRepos = org.publicRepos || 0;
    const orgWeight =
      Math.log10(orgFollowers + orgRepos + orgStars + 1) *
      ORG_LEADERSHIP_MULTIPLIER;
    orgLeadershipSum += orgWeight;
  }

  const score = Math.min(
    MAX_SCORE,
    Math.round(activeCount * ORG_ACTIVE_COUNT_WEIGHT + orgLeadershipSum),
  );

  return { score, activeCount };
};
