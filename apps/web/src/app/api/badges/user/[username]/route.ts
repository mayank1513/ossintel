import { NextResponse } from "next/server";
import {
  BADGE_CACHE_HEADERS,
  BADGE_CORS_HEADERS,
  BADGE_ERROR_RESPONSE,
  getUserBadge,
  parseBadgeQueryParams,
  syncBadgeToGithubAppRepo,
  type UserMetric,
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
  context: { params: Promise<{ username: string }> },
) => {
  try {
    const { username } = await context.params;
    const cleanUser = username.endsWith(".json")
      ? username.slice(0, -5)
      : username;
    const { style, label, logo, metric } = parseBadgeQueryParams(request.url);

    const badgeData = await getUserBadge(cleanUser, {
      metric: metric as UserMetric,
      style,
      label,
      logo,
    });

    if (metric === "overall") {
      try {
        await syncBadgeToGithubAppRepo({
          filePath: `user/${cleanUser.toLowerCase()}.json`,
          badgeData,
        });
      } catch (err) {
        console.error("[Badges] User route badge sync error:", err);
      }
    }

    return NextResponse.json(badgeData, {
      headers: BADGE_CACHE_HEADERS,
    });
  } catch (error) {
    console.error("Failed to generate user badge", error);
    return NextResponse.json(BADGE_ERROR_RESPONSE, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
