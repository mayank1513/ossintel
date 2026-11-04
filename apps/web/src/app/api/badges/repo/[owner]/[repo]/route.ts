import { NextResponse } from "next/server";
import {
  getRepoBadge,
  type RepoMetric,
  syncBadgeToGithubAppRepo,
} from "@/lib/badges";

export const dynamic = "force-dynamic";

export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const GET = async (
  request: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) => {
  try {
    const { owner, repo } = await context.params;
    const cleanRepo = repo.endsWith(".json") ? repo.slice(0, -5) : repo;

    const url = new URL(request.url);
    const metric = (url.searchParams.get("metric") as RepoMetric) || "overall";
    const style = url.searchParams.get("style") as
      | "flat"
      | "flat-square"
      | "plastic"
      | "for-the-badge"
      | "social"
      | undefined;
    const label = url.searchParams.get("label") || undefined;
    const logo = url.searchParams.get("logo") || undefined;

    const badgeData = await getRepoBadge(owner, cleanRepo, {
      metric,
      style,
      label,
      logo,
    });

    // Asynchronously trigger sync to GitHub App repo if metric is default overall
    if (metric === "overall") {
      syncBadgeToGithubAppRepo({
        filePath: `badges/repo/${owner.toLowerCase()}/${cleanRepo.toLowerCase()}.json`,
        badgeData,
      }).catch((err) => {
        console.debug("[Badges] Background repo sync error:", err);
      });
    }

    return NextResponse.json(badgeData, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to generate repo badge", error);
    return NextResponse.json(
      {
        schemaVersion: 1,
        label: "OSSIntel",
        message: "unavailable",
        color: "inactive",
        isError: true,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
};
