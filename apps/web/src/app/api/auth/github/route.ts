import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID is not configured" },
      { status: 500 },
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${appUrl}/api/auth/github/callback`;

  const target = new URL("https://github.com/login/oauth/authorize");
  target.searchParams.set("client_id", clientId);
  target.searchParams.set("redirect_uri", redirectUri);
  target.searchParams.set("scope", "read:user");
  target.searchParams.set("state", state);

  const response = NextResponse.redirect(target.toString());
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 300, // 5 minutes
    path: "/",
    sameSite: "lax",
  });

  return response;
}
