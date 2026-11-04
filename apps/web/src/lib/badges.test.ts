import type { IdentityScores, RepositoryScores } from "@ossintel/scoring";
import { describe, expect, test } from "vitest";
import {
  formatRepoBadge,
  formatUserBadge,
  getRiskScoreColor,
  getScoreColor,
} from "./badges";

describe("Badges Library - Shields.io Endpoint Compliance", () => {
  describe("getScoreColor", () => {
    test("returns brightgreen for scores >= 85", () => {
      expect(getScoreColor(85)).toBe("brightgreen");
      expect(getScoreColor(99)).toBe("brightgreen");
      expect(getScoreColor(100)).toBe("brightgreen");
    });

    test("returns green for scores 70-84", () => {
      expect(getScoreColor(70)).toBe("green");
      expect(getScoreColor(84)).toBe("green");
    });

    test("returns yellow for scores 50-69", () => {
      expect(getScoreColor(50)).toBe("yellow");
      expect(getScoreColor(69)).toBe("yellow");
    });

    test("returns orange for scores 30-49", () => {
      expect(getScoreColor(30)).toBe("orange");
      expect(getScoreColor(49)).toBe("orange");
    });

    test("returns red for scores < 30", () => {
      expect(getScoreColor(29)).toBe("red");
      expect(getScoreColor(0)).toBe("red");
    });
  });

  describe("getRiskScoreColor", () => {
    test("inverts risk score: lower is better", () => {
      expect(getRiskScoreColor(10)).toBe("brightgreen");
      expect(getRiskScoreColor(20)).toBe("brightgreen");
      expect(getRiskScoreColor(35)).toBe("green");
      expect(getRiskScoreColor(55)).toBe("yellow");
      expect(getRiskScoreColor(75)).toBe("orange");
      expect(getRiskScoreColor(85)).toBe("red");
    });
  });

  describe("formatRepoBadge", () => {
    const mockRepoScores: RepositoryScores = {
      overall: 88,
      velocity: 92,
      health: 80,
      community: 75,
      impact: 85,
      risk: 15,
    };

    test("formats overall badge by default with Shields.io schemaVersion 1", () => {
      const badge = formatRepoBadge(mockRepoScores);
      expect(badge.schemaVersion).toBe(1);
      expect(badge.label).toBe("OSSIntel Alpha");
      expect(badge.message).toBe("88/100");
      expect(badge.color).toBe("brightgreen");
      expect(badge.namedLogo).toBe("github");
      expect(badge.cacheSeconds).toBe(3600);
    });

    test("supports velocity metric", () => {
      const badge = formatRepoBadge(mockRepoScores, { metric: "velocity" });
      expect(badge.label).toBe("OSS Velocity");
      expect(badge.message).toBe("92/100");
      expect(badge.color).toBe("brightgreen");
    });

    test("supports health metric", () => {
      const badge = formatRepoBadge(mockRepoScores, { metric: "health" });
      expect(badge.label).toBe("OSS Health");
      expect(badge.message).toBe("80/100");
      expect(badge.color).toBe("green");
    });

    test("supports risk metric with inverted coloring", () => {
      const badge = formatRepoBadge(mockRepoScores, { metric: "risk" });
      expect(badge.label).toBe("OSS Risk");
      expect(badge.message).toBe("15/100");
      expect(badge.color).toBe("brightgreen");
    });

    test("supports custom styles and labels", () => {
      const badge = formatRepoBadge(mockRepoScores, {
        style: "for-the-badge",
        label: "Alpha Rating",
        logo: "npm",
      });
      expect(badge.style).toBe("for-the-badge");
      expect(badge.label).toBe("Alpha Rating");
      expect(badge.namedLogo).toBe("npm");
    });
  });

  describe("formatUserBadge", () => {
    const mockIdentityScores: IdentityScores = {
      overall: 91,
      maintainer: 94,
      contributor: 82,
      organization: 70,
      influence: 88,
      confidence: "High",
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

    test("formats overall user badge with OSSIQ metric", () => {
      const badge = formatUserBadge(mockIdentityScores);
      expect(badge.schemaVersion).toBe(1);
      expect(badge.label).toBe("OSSIntel OSSIQ");
      expect(badge.message).toBe("91/100");
      expect(badge.color).toBe("brightgreen");
    });

    test("supports maintainer metric", () => {
      const badge = formatUserBadge(mockIdentityScores, {
        metric: "maintainer",
      });
      expect(badge.label).toBe("OSS Maintainer");
      expect(badge.message).toBe("94/100");
      expect(badge.color).toBe("brightgreen");
    });

    test("supports contributor metric", () => {
      const badge = formatUserBadge(mockIdentityScores, {
        metric: "contributor",
      });
      expect(badge.label).toBe("OSS Contributor");
      expect(badge.message).toBe("82/100");
      expect(badge.color).toBe("green");
    });

    test("supports influence metric", () => {
      const badge = formatUserBadge(mockIdentityScores, {
        metric: "influence",
      });
      expect(badge.label).toBe("OSS Influence");
      expect(badge.message).toBe("88/100");
      expect(badge.color).toBe("brightgreen");
    });
  });
});
