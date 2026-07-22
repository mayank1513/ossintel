import { fetchNpmPackage } from "@ossintel/npm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { packageName } = await request.json();
    if (!packageName) {
      return NextResponse.json(
        { error: "Package name is required" },
        { status: 400 },
      );
    }

    const pkg = await fetchNpmPackage(packageName);
    return NextResponse.json(pkg);
  } catch (error: unknown) {
    console.error("npm Package API failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch npm package";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
