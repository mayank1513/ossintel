import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto-helper";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 },
    );
  }

  if (!state || state !== savedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not configured" },
      { status: 500 },
    );
  }

  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      },
    );

    if (!tokenRes.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const data = await tokenRes.json();
    const accessToken = data.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token returned from GitHub" },
        { status: 400 },
      );
    }

    const encrypted = encrypt(accessToken);
    cookieStore.set("github_pat", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Redirect back to main page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/`);
  } catch (err) {
    console.error("GitHub OAuth callback failed", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
