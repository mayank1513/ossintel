import { NextResponse } from "next/server";
import {
  getUserBadge,
  syncBadgeToGithubAppRepo,
  type UserMetric,
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
  context: { params: Promise<{ username: string }> },
) => {
  try {
    const { username } = await context.params;
    const cleanUser = username.endsWith(".json")
      ? username.slice(0, -5)
      : username;

    const url = new URL(request.url);
    const metric = (url.searchParams.get("metric") as UserMetric) || "overall";
    const style = url.searchParams.get("style") as
      | "flat"
      | "flat-square"
      | "plastic"
      | "for-the-badge"
      | "social"
      | undefined;
    const label = url.searchParams.get("label") || undefined;
    const logo = url.searchParams.get("logo") || undefined;

    const badgeData = await getUserBadge(cleanUser, {
      metric,
      style,
      label,
      logo,
    });

    if (metric === "overall") {
      syncBadgeToGithubAppRepo({
        filePath: `badges/user/${cleanUser.toLowerCase()}.json`,
        badgeData,
      }).catch((err) => {
        console.debug("[Badges] Background user sync error:", err);
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
    console.error("Failed to generate user badge", error);
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
