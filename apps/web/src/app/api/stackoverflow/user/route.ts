import { fetchStackOverflowUser } from "@ossintel/stackoverflow";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { query, apiKey } = await request.json();
    const userId = query || "";
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const key = apiKey || process.env["STACKEXCHANGE_API_KEY"] || undefined;
    const soUser = await fetchStackOverflowUser(userId, { apiKey: key });
    return NextResponse.json(soUser);
  } catch (error: unknown) {
    console.error("Stack Overflow User API failed", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch Stack Overflow user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
