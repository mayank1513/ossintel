import { afterEach, describe, expect, test, vi } from "vitest";
import {
  fetchRepoOssintelConfig,
  fetchUserOssintelConfig,
} from "./server-cache";

describe("server-cache .ossintel.json config discovery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("fetchRepoOssintelConfig parses and normalizes base64 contents from GitHub API", async () => {
    const rawConfig = {
      $schema: "https://ossintel.js.org/schemas/0.3.0/schema.json",
      version: "1",
      profile: {
        orgs: {
          priority: ["acme-corp"],
          exclude: ["legacy-org"],
        },
      },
      telemetry: {
        languages: {
          ignore: ["Shell"],
          primaryOverride: "TypeScript",
        },
        ignorePaths: ["docs/**", "legacy/"],
      },
    };

    const base64Content = Buffer.from(JSON.stringify(rawConfig)).toString(
      "base64",
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: base64Content,
        encoding: "base64",
      }),
    } as Response);

    const config = await fetchRepoOssintelConfig("test-owner", "test-repo");

    expect(config).not.toBeNull();
    expect(config?.version).toBe("1");
    expect(config?.profile.orgs.priority[0]?.org).toBe("acme-corp");
    expect(config?.profile.orgs.exclude[0]?.org).toBe("legacy-org");
    expect(config?.telemetry.languages.ignore[0]?.language).toBe("Shell");
    expect(config?.telemetry.languages.primaryOverride).toBe("TypeScript");
    expect(config?.telemetry.ignorePaths).toHaveLength(2);
  });

  test("fetchRepoOssintelConfig returns null when file is not found (404)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const config = await fetchRepoOssintelConfig(
      "test-owner",
      "no-config-repo",
    );
    expect(config).toBeNull();
  });

  test("fetchUserOssintelConfig checks user/.github then falls back to user/user", async () => {
    const rawConfig = {
      version: "1",
      profile: {
        repositories: {
          pinned: ["cool-project"],
        },
      },
    };
    const base64Content = Buffer.from(JSON.stringify(rawConfig)).toString(
      "base64",
    );

    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.includes("/dev/.github/contents/")) {
          return { ok: false, status: 404 } as Response;
        }
        if (url.includes("/dev/dev/contents/")) {
          return {
            ok: true,
            json: async () => ({
              content: base64Content,
              encoding: "base64",
            }),
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      },
    );

    const config = await fetchUserOssintelConfig("dev");

    expect(config).not.toBeNull();
    expect(config?.profile.repositories.pinned[0]?.repo).toBe("cool-project");
  });
});
