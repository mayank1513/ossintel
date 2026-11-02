import {
  INFLUENCE_FORK_WEIGHT,
  INFLUENCE_NPM_BONUS_CAP,
  INFLUENCE_NPM_BONUS_MULTIPLIER,
  INFLUENCE_SO_BONUS_CAP,
  INFLUENCE_SO_BONUS_MULTIPLIER,
  INFLUENCE_STAR_WEIGHT,
  MAX_SCORE,
} from "./constants";
import { logScale } from "./utils";

export interface InfluenceResult {
  /** Final influence score (0-100). */
  score: number;
  /** GitHub-only influence base. */
  githubBase: number;
  /** Additive npm bonus (0-15). */
  npmBonus: number;
  /** Additive Stack Overflow bonus (0-15). */
  soBonus: number;
}

/**
 * Calculate the influence pillar score.
 *
 * GitHub stars and forks form the base. npm downloads and
 * Stack Overflow reputation provide bounded additive bonuses.
 */
export const calculateInfluenceScore = (
  totalStarsCount: number,
  totalForksCount: number,
  totalNpmDownloads: number,
  soReputation: number,
): InfluenceResult => {
  const starWeight = logScale(totalStarsCount, INFLUENCE_STAR_WEIGHT);
  const forkWeight = logScale(totalForksCount, INFLUENCE_FORK_WEIGHT);
  const githubBase = Math.min(MAX_SCORE, Math.round(starWeight + forkWeight));

  const npmBonus =
    totalNpmDownloads > 0
      ? logScale(
          totalNpmDownloads,
          INFLUENCE_NPM_BONUS_MULTIPLIER,
          INFLUENCE_NPM_BONUS_CAP,
        )
      : 0;

  const soBonus =
    soReputation > 0
      ? logScale(
          soReputation,
          INFLUENCE_SO_BONUS_MULTIPLIER,
          INFLUENCE_SO_BONUS_CAP,
        )
      : 0;

  const score = Math.min(
    MAX_SCORE,
    Math.round(githubBase + npmBonus + soBonus),
  );

  return { score, githubBase, npmBonus, soBonus };
};
