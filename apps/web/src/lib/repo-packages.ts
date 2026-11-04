import {
  detectManifests,
  type NormalizedOssintelConfig,
  type PackageManifest,
  shouldIgnorePath,
} from "@ossintel/input-parser";
import { fetchNpmPackage, type NormalizedNpmPackage } from "@ossintel/npm";
import type { PackageVelocity } from "@ossintel/scoring";

export interface RepoPackagesResult {
  manifests: PackageManifest[];
  npmPackages: NormalizedNpmPackage[];
  packageVelocities: PackageVelocity[];
}

interface GitTreeNode {
  path: string;
  type: string;
  sha: string;
}

interface GitTreeResponse {
  tree?: GitTreeNode[];
  truncated?: boolean;
}

const MAX_PACKAGES_TO_SCAN = 25;
const FETCH_TIMEOUT_MS = 6000;

/**
 * Discovers and parses package.json manifests from a GitHub repository,
 * and fetches live npm velocity data for any published packages.
 */
export const fetchRepoPackages = async (
  owner: string,
  repo: string,
  defaultBranch = "main",
  options?: { token?: string },
  config?: NormalizedOssintelConfig | null,
): Promise<RepoPackagesResult> => {
  const branch = defaultBranch || "main";
  let manifestPaths: string[] = ["package.json"];

  // 1. Discover all package.json files using GitHub Git Trees API
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "OSSIntel-App",
    };
    if (options?.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const treeUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const res = await fetch(treeUrl, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (res.ok) {
      const data = (await res.json()) as GitTreeResponse;
      if (Array.isArray(data.tree)) {
        const foundPaths = data.tree
          .filter(
            (node) =>
              node.type === "blob" &&
              node.path.endsWith("package.json") &&
              !node.path.includes("node_modules/") &&
              !node.path.includes("/.") &&
              !node.path.includes("/test/") &&
              !node.path.includes("/tests/") &&
              !node.path.includes("/fixtures/") &&
              !node.path.includes("/examples/") &&
              (!config || !shouldIgnorePath(node.path, config)),
          )
          .map((node) => node.path);

        if (foundPaths.length > 0) {
          // Sort so root package.json is prioritized
          foundPaths.sort((a, b) => {
            if (a === "package.json") return -1;
            if (b === "package.json") return 1;
            return a.localeCompare(b);
          });
          manifestPaths = foundPaths.slice(0, MAX_PACKAGES_TO_SCAN);
        }
      }
    }
  } catch (err) {
    console.warn(
      "Git tree recursive fetch failed, falling back to root package.json:",
      err,
    );
  }

  // 2. Fetch raw package.json contents in parallel via raw.githubusercontent.com
  const manifestResults = await Promise.allSettled(
    manifestPaths.map(async (filePath) => {
      const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${filePath}`;
      const res = await fetch(rawUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      return (await res.json()) as PackageManifest;
    }),
  );

  const manifests: PackageManifest[] = [];
  for (const r of manifestResults) {
    if (r.status === "fulfilled" && r.value && typeof r.value === "object") {
      manifests.push(r.value);
    }
  }

  if (manifests.length === 0) {
    return { manifests: [], npmPackages: [], packageVelocities: [] };
  }

  // 3. Auto-detect packages and filter out purely private non-monorepo configs
  const _detection = detectManifests(manifests);
  const publicCandidates = manifests.filter(
    (m) => typeof m.name === "string" && m.name.trim().length > 0 && !m.private,
  );

  // If all manifests are private, still attempt candidate packages if they have names (e.g. monorepos where root is private but subpackages are public)
  const candidateList =
    publicCandidates.length > 0
      ? publicCandidates
      : manifests.filter(
          (m) => typeof m.name === "string" && m.name.trim().length > 0,
        );

  // 4. Resolve NPM metadata for candidate packages in parallel
  const npmPackageResults = await Promise.allSettled(
    candidateList.map(async (manifest) => {
      const pkgName = manifest.name?.trim();
      if (!pkgName) return null;
      try {
        return await fetchNpmPackage(pkgName);
      } catch {
        // Not published on npm or 404
        return null;
      }
    }),
  );

  const npmPackages: NormalizedNpmPackage[] = [];
  for (const r of npmPackageResults) {
    if (r.status === "fulfilled" && r.value) {
      npmPackages.push(r.value);
    }
  }

  // 5. Construct package velocities
  const packageVelocities: PackageVelocity[] = npmPackages.map((pkg) => ({
    monthlyDownloads: pkg.monthlyDownloads,
    weeklyDownloads: pkg.weeklyDownloads,
    downloads: pkg.monthlyDownloads,
  }));

  return {
    manifests,
    npmPackages,
    packageVelocities,
  };
};
