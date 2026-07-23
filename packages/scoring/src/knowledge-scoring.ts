import type { NormalizedStackOverflowUser } from "@ossintel/stackoverflow";
import {
  KNOWLEDGE_ACCEPTANCE_WEIGHT,
  KNOWLEDGE_ANSWERS_WEIGHT,
  KNOWLEDGE_REP_WEIGHT,
  KNOWLEDGE_SO_ANSWERS_CAP,
  KNOWLEDGE_SO_ANSWERS_MULTIPLIER,
  KNOWLEDGE_SO_REP_CAP,
  KNOWLEDGE_SO_REP_MULTIPLIER,
  MAX_SCORE,
} from "./constants";

export interface KnowledgeScore {
  /** Overall knowledge sharing score (0-100). */
  score: number;
  /** Breakdown of sub-scores contributing to the overall. */
  breakdown: {
    /** Score based on reputation volume (0-100). */
    reputation: number;
    /** Score based on answer count (0-100). */
    answers: number;
    /** Score based on acceptance rate (0-100). */
    acceptance: number;
  };
}

/**
 * Calculate a Knowledge Sharing capability score.
 *
 * Currently evaluates Stack Overflow presence only. Designed to be
 * extended with additional platforms (Dev.to, Hashnode, etc.)
 * by adding optional parameters without breaking existing callers.
 *
 * @returns A score (0-100) with breakdown, or null if no data is available.
 */
export const calculateKnowledgeScore = (
  stackoverflowUser?: NormalizedStackOverflowUser | null,
): KnowledgeScore | null => {
  if (!stackoverflowUser) return null;

  const soRep = stackoverflowUser.reputation ?? 0;

  const reputation = Math.min(
    KNOWLEDGE_SO_REP_CAP,
    Math.log10(soRep + 1) * KNOWLEDGE_SO_REP_MULTIPLIER,
  );
  const answers = Math.min(
    KNOWLEDGE_SO_ANSWERS_CAP,
    stackoverflowUser.answerCount * KNOWLEDGE_SO_ANSWERS_MULTIPLIER,
  );
  const acceptance = stackoverflowUser.acceptanceRate || 0;

  const score = Math.min(
    MAX_SCORE,
    Math.round(
      reputation * KNOWLEDGE_REP_WEIGHT +
        answers * KNOWLEDGE_ANSWERS_WEIGHT +
        acceptance * KNOWLEDGE_ACCEPTANCE_WEIGHT,
    ),
  );

  return {
    score,
    breakdown: {
      reputation: Math.round(reputation),
      answers: Math.round(answers),
      acceptance: Math.round(acceptance),
    },
  };
};
