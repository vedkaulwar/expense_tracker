import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return { uid: null, error: "No session token" };
  try {
    const decoded = await adminAuth.verifyToken(token);
    return { uid: decoded.uid, error: null };
  } catch (err: any) {
    console.error("Session verification failed:", err.message);
    return { uid: null, error: err.message };
  }
}

export async function GET(request: Request) {
  try {
    const { uid: userId, error: authError } = await getUserId();
    console.log("DEBUG: GET Transactions for user:", userId);
    
    if (!userId) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitCount = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 50;

    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .orderBy("date", "desc")
      .limit(limitCount)
      .get();

    console.log("DEBUG: Found transactions count:", snapshot.size);

    const transactions = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date,
    }));

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { uid: userId, error: authError } = await getUserId();
    console.log("DEBUG: POST Transaction for user:", userId);

    if (!userId) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("DEBUG: Posting data:", body);
    
    const transactionData = {
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
      createdAt: new Date(),
    };

    const docRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .add(transactionData);

    console.log("DEBUG: Created doc ID:", docRef.id);

    return NextResponse.json({ _id: docRef.id, ...transactionData }, { status: 201 });
  } catch (error: any) {
    console.error("POST Transaction Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create transaction" }, { status: 500 });
  }
}
