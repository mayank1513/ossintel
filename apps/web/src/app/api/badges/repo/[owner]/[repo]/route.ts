import { NextResponse } from "next/server";
import {
  BADGE_CACHE_HEADERS,
  BADGE_CORS_HEADERS,
  BADGE_ERROR_RESPONSE,
  getRepoBadge,
  parseBadgeQueryParams,
  type RepoMetric,
  syncBadgeToGithubAppRepo,
} from "@/lib/badges";

export const dynamic = "force-dynamic";

export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: BADGE_CORS_HEADERS,
  });
};

export const GET = async (
  request: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) => {
  try {
    const { owner, repo } = await context.params;
    const cleanRepo = repo.endsWith(".json") ? repo.slice(0, -5) : repo;
    const { style, label, logo, metric } = parseBadgeQueryParams(request.url);

    const badgeData = await getRepoBadge(owner, cleanRepo, {
      metric: metric as RepoMetric,
      style,
      label,
      logo,
    });

    // Asynchronously trigger sync to GitHub App repo if metric is default overall
    if (metric === "overall") {
      syncBadgeToGithubAppRepo({
        filePath: `repo/${owner.toLowerCase()}/${cleanRepo.toLowerCase()}.json`,
        badgeData,
      }).catch((err) => {
        console.debug("[Badges] Background repo sync error:", err);
      });
    }

    return NextResponse.json(badgeData, {
      headers: BADGE_CACHE_HEADERS,
    });
  } catch (error) {
    console.error("Failed to generate repo badge", error);
    return NextResponse.json(BADGE_ERROR_RESPONSE, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
