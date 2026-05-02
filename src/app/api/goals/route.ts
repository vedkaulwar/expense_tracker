import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("goals")
      .orderBy("createdAt", "desc")
      .get();

    const goals = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(goals);
  } catch (error) {
    console.error("GET Goals Error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const goalData = {
      ...body,
      createdAt: new Date(),
    };

    const docRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("goals")
      .add(goalData);

    return NextResponse.json({ _id: docRef.id, ...goalData }, { status: 201 });
  } catch (error) {
    console.error("POST Goal Error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
