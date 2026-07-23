import type { NormalizedNpmUser } from "@ossintel/npm";
import {
  MAX_SCORE,
  PUBLISHING_DOWNLOADS_MULTIPLIER,
  PUBLISHING_DOWNLOADS_WEIGHT,
  PUBLISHING_PACKAGES_MULTIPLIER,
  PUBLISHING_PACKAGES_WEIGHT,
  PUBLISHING_VERIFIED_SCORE,
  PUBLISHING_VERIFIED_WEIGHT,
} from "./constants";

export interface PublishingScore {
  /** Overall publishing reputation score (0-100). */
  score: number;
  /** Breakdown of sub-scores contributing to the overall. */
  breakdown: {
    /** Score based on total download volume (0-100). */
    downloads: number;
    /** Score based on active package count (0-100). */
    packages: number;
    /** Score based on verified publisher status (0 or 100). */
    verified: number;
  };
}

/**
 * Calculate a Package Publishing capability score.
 *
 * Currently evaluates npm presence only. Designed to be extended
 * with additional registries (NuGet, PyPI, crates.io, Go, etc.)
 * by adding optional parameters without breaking existing callers.
 *
 * @returns A score (0-100) with breakdown, or null if no data is available.
 */
export const calculatePublishingScore = (
  npmUser?: NormalizedNpmUser | null,
): PublishingScore | null => {
  if (!npmUser) return null;

  const totalDownloads = npmUser.totalWeeklyDownloads ?? 0;

  const downloads = Math.min(
    MAX_SCORE,
    Math.log10(totalDownloads + 1) * PUBLISHING_DOWNLOADS_MULTIPLIER,
  );
  const packages = Math.min(
    MAX_SCORE,
    npmUser.activePackagesCount * PUBLISHING_PACKAGES_MULTIPLIER,
  );
  const verified = npmUser.isVerifiedPublisher ? PUBLISHING_VERIFIED_SCORE : 0;

  const score = Math.min(
    MAX_SCORE,
    Math.round(
      downloads * PUBLISHING_DOWNLOADS_WEIGHT +
        packages * PUBLISHING_PACKAGES_WEIGHT +
        verified * PUBLISHING_VERIFIED_WEIGHT,
    ),
  );

  return {
    score,
    breakdown: {
      downloads: Math.round(downloads),
      packages: Math.round(packages),
      verified,
    },
  };
};
