import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyToken(token);
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
      .collection("subscriptions")
      .orderBy("nextBillingDate", "asc")
      .get();

    const subscriptions = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("GET Subscriptions Error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const subData = {
      ...body,
      nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : new Date(),
      createdAt: new Date(),
    };

    const docRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("subscriptions")
      .add(subData);

    return NextResponse.json({ _id: docRef.id, ...subData }, { status: 201 });
  } catch (error) {
    console.error("POST Subscription Error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
