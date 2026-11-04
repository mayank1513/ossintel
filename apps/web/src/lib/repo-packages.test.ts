import * as npmClient from "@ossintel/npm";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchRepoPackages } from "./repo-packages";

describe("fetchRepoPackages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("discovers monorepo packages from git tree and fetches npm data", async () => {
    // Mock global.fetch for GitHub Git Trees API and raw.githubusercontent.com
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: RequestInfo | URL) => {
        const url = input.toString();

        if (url.includes("/git/trees/")) {
          return {
            ok: true,
            json: async () => ({
              tree: [
                { path: "package.json", type: "blob", sha: "root-sha" },
                {
                  path: "packages/core/package.json",
                  type: "blob",
                  sha: "core-sha",
                },
                {
                  path: "node_modules/foo/package.json",
                  type: "blob",
                  sha: "dep-sha",
                },
              ],
            }),
          } as Response;
        }

        if (url.endsWith("packages/core/package.json")) {
          return {
            ok: true,
            json: async () => ({
              name: "@test-scope/core",
              version: "1.0.0",
            }),
          } as Response;
        }

        if (url.endsWith("package.json")) {
          return {
            ok: true,
            json: async () => ({
              name: "test-monorepo-root",
              private: true,
              workspaces: ["packages/*"],
            }),
          } as Response;
        }

        return { ok: false, status: 404 } as Response;
      },
    );

    // Mock fetchNpmPackage from @ossintel/npm
    vi.spyOn(npmClient, "fetchNpmPackage").mockResolvedValue({
      name: "@test-scope/core",
      weeklyDownloads: 2500,
      monthlyDownloads: 10000,
      created: "2024-01-01T00:00:00Z",
      modified: "2024-06-01T00:00:00Z",
      version: "1.0.0",
      versionsCount: 3,
      releaseFrequency: 3,
      isDeprecated: false,
      deprecationMessage: null,
      hasTypeScript: true,
      hasESM: true,
      hasCJS: true,
      license: "MIT",
      dependentsCount: 50,
      maintainers: ["test-dev"],
      bugs: null,
      homepage: null,
      repository: null,
      categories: [],
      description: "Core utility library",
    });

    const result = await fetchRepoPackages("test-owner", "test-repo", "main");

    expect(result.manifests).toHaveLength(2);
    expect(result.npmPackages).toHaveLength(1);
    expect(result.npmPackages[0]?.name).toBe("@test-scope/core");
    expect(result.packageVelocities).toHaveLength(1);
    expect(result.packageVelocities[0]?.monthlyDownloads).toBe(10000);
  });

  test("handles empty repository or network failures gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network failure"),
    );

    const result = await fetchRepoPackages("test-owner", "empty-repo", "main");

    expect(result.manifests).toHaveLength(0);
    expect(result.npmPackages).toHaveLength(0);
    expect(result.packageVelocities).toHaveLength(0);
  });

  test("honors config.telemetry.ignorePaths by ignoring specified package paths", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: RequestInfo | URL) => {
        const url = input.toString();

        if (url.includes("/git/trees/")) {
          return {
            ok: true,
            json: async () => ({
              tree: [
                { path: "package.json", type: "blob", sha: "root-sha" },
                {
                  path: "packages/ignored-pkg/package.json",
                  type: "blob",
                  sha: "ignored-sha",
                },
                {
                  path: "packages/active-pkg/package.json",
                  type: "blob",
                  sha: "active-sha",
                },
              ],
            }),
          } as Response;
        }

        if (url.endsWith("packages/active-pkg/package.json")) {
          return {
            ok: true,
            json: async () => ({
              name: "@test-scope/active",
              version: "1.0.0",
            }),
          } as Response;
        }

        if (url.endsWith("package.json")) {
          return {
            ok: true,
            json: async () => ({
              name: "test-monorepo-root",
              private: true,
            }),
          } as Response;
        }

        return { ok: false, status: 404 } as Response;
      },
    );

    const mockConfig = {
      version: "1",
      profile: {
        orgs: { priority: [], exclude: [] },
        repositories: { pinned: [], exclude: [] },
      },
      telemetry: {
        languages: { ignore: [] },
        ignorePaths: [{ pattern: "packages/ignored-pkg/**" }],
      },
    };

    const result = await fetchRepoPackages(
      "test-owner",
      "test-repo",
      "main",
      {},
      mockConfig,
    );

    expect(result.manifests.some((m) => m.name === "@test-scope/active")).toBe(
      true,
    );
    expect(
      result.manifests.some((m) => m.name === "@test-scope/ignored-pkg"),
    ).toBe(false);
  });
});
