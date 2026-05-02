import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 5 days in milliseconds
const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    // First verify the ID token is valid
    await adminAuth.verifyIdToken(token);

    // Exchange the short-lived ID token for a long-lived session cookie (5 days)
    const sessionCookie = await adminAuth.createSessionCookie(token, SESSION_DURATION_MS);

    // Store the session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5, // 5 days in seconds
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

