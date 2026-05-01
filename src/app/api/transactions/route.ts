import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const transactions = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date, // Convert Firestore timestamp to JS date
    }));

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Ensure date is a Date object or Firestore Timestamp
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

    return NextResponse.json({ _id: docRef.id, ...transactionData }, { status: 201 });
  } catch (error) {
    console.error("POST Transaction Error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
