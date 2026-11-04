import { describe, expect, test } from "vitest";
import {
  getLanguageIgnoreReason,
  getPathIgnoreReason,
  matchGlobPattern,
  normalizeOssintelConfig,
  shouldExcludeRepo,
  shouldIgnoreLanguage,
  shouldIgnorePath,
} from "./config";

describe("OSSIntel Config Schema & Helpers", () => {
  const sampleConfig = normalizeOssintelConfig({
    version: "1",
    profile: {
      orgs: {
        priority: [
          { org: "md2docx", reason: "Flagship compiler" },
          "turboforge",
        ],
        exclude: [{ org: "legacy-client", reason: "Deprecated" }],
      },
      repositories: {
        pinned: [{ repo: "md2docx/md2docx", reason: "Core project" }],
        exclude: [
          { repo: "mayank1513/scratchpad", reason: "Experimental" },
          "mayank1513/dotfiles",
        ],
      },
    },
    telemetry: {
      languages: {
        ignore: [
          {
            language: "MDX",
            reason: "Auto-generated TypeDoc and Fumadocs API documentation",
          },
          "HTML",
        ],
        primaryOverride: "TypeScript",
      },
      ignorePaths: [
        {
          pattern: "apps/web/content/docs/**",
          reason: "Compiled documentation site corpus",
        },
        "dist/**",
        "**/generated/**",
        "apps/web/.source",
      ],
    },
  });

  describe("normalizeOssintelConfig", () => {
    test("normalizes string items into structured objects", () => {
      expect(sampleConfig.profile.orgs.priority[0]).toEqual({
        org: "md2docx",
        reason: "Flagship compiler",
      });
      expect(sampleConfig.profile.orgs.priority[1]).toEqual({
        org: "turboforge",
        reason: undefined,
      });
    });

    test("handles empty or null inputs gracefully", () => {
      const empty = normalizeOssintelConfig(null);
      expect(empty.version).toBe("1");
      expect(empty.telemetry.languages.ignore).toEqual([]);
      expect(empty.telemetry.ignorePaths).toEqual([]);
    });
  });

  describe("shouldIgnoreLanguage & reasons", () => {
    test("identifies ignored languages case-insensitively", () => {
      expect(shouldIgnoreLanguage("MDX", sampleConfig)).toBe(true);
      expect(shouldIgnoreLanguage("mdx", sampleConfig)).toBe(true);
      expect(shouldIgnoreLanguage("HTML", sampleConfig)).toBe(true);
      expect(shouldIgnoreLanguage("TypeScript", sampleConfig)).toBe(false);
    });

    test("retrieves the user-facing explanation for language exclusion", () => {
      expect(getLanguageIgnoreReason("MDX", sampleConfig)).toBe(
        "Auto-generated TypeDoc and Fumadocs API documentation",
      );
      expect(getLanguageIgnoreReason("HTML", sampleConfig)).toBeUndefined();
      expect(
        getLanguageIgnoreReason("TypeScript", sampleConfig),
      ).toBeUndefined();
    });
  });

  describe("shouldIgnorePath & matchGlobPattern", () => {
    test("matches glob patterns with **", () => {
      expect(
        matchGlobPattern(
          "apps/web/content/docs/**",
          "apps/web/content/docs/api/index.mdx",
        ),
      ).toBe(true);
      expect(matchGlobPattern("dist/**", "dist/bundle.js")).toBe(true);
      expect(
        matchGlobPattern(
          "**/generated/**",
          "packages/core/src/generated/types.ts",
        ),
      ).toBe(true);
    });

    test("matches directory prefix without globstar", () => {
      expect(
        matchGlobPattern("apps/web/.source", "apps/web/.source/index.ts"),
      ).toBe(true);
      expect(
        matchGlobPattern("apps/web/.source", "apps/web/other/file.ts"),
      ).toBe(false);
    });

    test("shouldIgnorePath checks against all configured rules", () => {
      expect(
        shouldIgnorePath(
          "apps/web/content/docs/packages/scoring.mdx",
          sampleConfig,
        ),
      ).toBe(true);
      expect(
        shouldIgnorePath("packages/scoring/src/index.ts", sampleConfig),
      ).toBe(false);
    });

    test("retrieves user-facing explanation for path exclusion", () => {
      expect(
        getPathIgnoreReason(
          "apps/web/content/docs/packages/scoring.mdx",
          sampleConfig,
        ),
      ).toBe("Compiled documentation site corpus");
    });
  });

  describe("shouldExcludeRepo", () => {
    test("excludes exact matching repository names", () => {
      expect(shouldExcludeRepo("mayank1513/scratchpad", sampleConfig)).toBe(
        true,
      );
      expect(shouldExcludeRepo("mayank1513/dotfiles", sampleConfig)).toBe(true);
      expect(shouldExcludeRepo("mayank1513/md2docx", sampleConfig)).toBe(false);
    });
  });
});
