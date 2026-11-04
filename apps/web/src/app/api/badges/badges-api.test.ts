import { describe, expect, test, vi } from "vitest";
import {
  GET as getRepoBadgeRoute,
  OPTIONS as optionsRepoRoute,
} from "./repo/[owner]/[repo]/route";
import {
  GET as getUserBadgeRoute,
  OPTIONS as optionsUserRoute,
} from "./user/[username]/route";

vi.mock("@/lib/badges", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/badges")>("@/lib/badges");
  return {
    ...actual,
    getRepoBadge: vi.fn(async (_owner: string, _repo: string, options = {}) => {
      return actual.formatRepoBadge(
        {
          overall: 92,
          velocity: 88,
          health: 90,
          community: 85,
          impact: 95,
          risk: 12,
        },
        options,
      );
    }),
    getUserBadge: vi.fn(async (_username: string, options = {}) => {
      return actual.formatUserBadge(
        {
          overall: 95,
          maintainer: 96,
          contributor: 89,
          organization: 80,
          influence: 92,
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
        },
        options,
      );
    }),
    syncBadgeToGithubAppRepo: vi.fn(async () => true),
  };
});

describe("Badges API Routes", () => {
  describe("Repo Badge Route", () => {
    test("handles OPTIONS CORS preflight", async () => {
      const res = await optionsRepoRoute();
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });

    test("returns overall badge for repository", async () => {
      const req = new Request(
        "https://ossintel.js.org/api/badges/repo/ossintel/ossintel",
      );
      const res = await getRepoBadgeRoute(req, {
        params: Promise.resolve({ owner: "ossintel", repo: "ossintel" }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("application/json");
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");

      const data = await res.json();
      expect(data.schemaVersion).toBe(1);
      expect(data.label).toBe("OSSIntel Alpha");
      expect(data.message).toBe("92/100");
      expect(data.color).toBe("brightgreen");
    });

    test("handles .json suffix gracefully", async () => {
      const req = new Request(
        "https://ossintel.js.org/api/badges/repo/ossintel/ossintel.json",
      );
      const res = await getRepoBadgeRoute(req, {
        params: Promise.resolve({ owner: "ossintel", repo: "ossintel.json" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.schemaVersion).toBe(1);
      expect(data.message).toBe("92/100");
    });

    test("respects query parameters like metric and style", async () => {
      const req = new Request(
        "https://ossintel.js.org/api/badges/repo/ossintel/ossintel?metric=velocity&style=for-the-badge&label=Velocity",
      );
      const res = await getRepoBadgeRoute(req, {
        params: Promise.resolve({ owner: "ossintel", repo: "ossintel" }),
      });

      const data = await res.json();
      expect(data.label).toBe("Velocity");
      expect(data.message).toBe("88/100");
      expect(data.style).toBe("for-the-badge");
    });
  });

  describe("User Badge Route", () => {
    test("handles OPTIONS CORS preflight", async () => {
      const res = await optionsUserRoute();
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });

    test("returns overall OSSIQ badge for developer", async () => {
      const req = new Request(
        "https://ossintel.js.org/api/badges/user/mayank1513",
      );
      const res = await getUserBadgeRoute(req, {
        params: Promise.resolve({ username: "mayank1513" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.schemaVersion).toBe(1);
      expect(data.label).toBe("OSSIntel OSSIQ");
      expect(data.message).toBe("95/100");
      expect(data.color).toBe("brightgreen");
    });

    test("supports metric query param for maintainer", async () => {
      const req = new Request(
        "https://ossintel.js.org/api/badges/user/mayank1513.json?metric=maintainer",
      );
      const res = await getUserBadgeRoute(req, {
        params: Promise.resolve({ username: "mayank1513.json" }),
      });

      const data = await res.json();
      expect(data.label).toBe("OSS Maintainer");
      expect(data.message).toBe("96/100");
    });
  });
});
