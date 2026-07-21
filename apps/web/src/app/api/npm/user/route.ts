import { fetchNpmUser } from "@ossintel/npm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const username = query || "";
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    const npmUser = await fetchNpmUser(username);
    return NextResponse.json(npmUser);
  } catch (error: unknown) {
    console.error("npm User API failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch npm user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
