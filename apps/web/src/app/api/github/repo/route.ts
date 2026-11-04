import { NextResponse } from "next/server";
import { handleGithubRouteError } from "@/lib/api-helpers";
import {
  calculateRepoScoreFromRaw,
  syncRepoBadgeBackground,
} from "@/lib/badges";
import { getDecryptedToken } from "@/lib/cookie-token";
import { getInstallationToken } from "@/lib/github-app";
import { getCachedRepositoryData } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  try {
    const { owner, repo, token: reqToken, forceRefresh } = await request.json();
    const ownerName = owner || "";
    const repoName = repo || "";

    // Resolve token: App installation token first, fall back to Cookie PAT
    let token = await getInstallationToken(ownerName);
    if (!token) {
      token = await getDecryptedToken(reqToken);
    }
    const options = { token };

    const result = await getCachedRepositoryData(
      ownerName,
      repoName,
      options,
      forceRefresh,
    );

    // Asynchronously trigger background badge sync to ossintel/badges repo
    try {
      const scores = calculateRepoScoreFromRaw(result);
      syncRepoBadgeBackground(ownerName, repoName, scores);
    } catch (badgeErr) {
      console.debug("[Badges] Background repo badge sync skipped:", badgeErr);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Repository API failed", error);
    return handleGithubRouteError(error, "Failed to fetch repository");
  }
};
