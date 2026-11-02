import { MAX_SCORE } from "./constants";

/**
 * Calculates a bounded logarithmic score:
 * score = min(max, log10(value + 1) * multiplier)
 *
 * @param value - The input metric count (e.g. downloads, stars, reputation)
 * @param multiplier - Scaling factor for log10
 * @param max - Upper bound cap (defaults to MAX_SCORE = 100)
 * @returns Scaled score (0 to max)
 */
export const logScale = (
  value: number,
  multiplier: number,
  max: number = MAX_SCORE,
): number => {
  if (value <= 0) return 0;
  return Math.min(max, Math.log10(value + 1) * multiplier);
};
