import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    return NextResponse.json({ 
      user: { 
        name: decoded.name || decoded.email?.split("@")[0] || "User", 
        email: decoded.email 
      } 
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
