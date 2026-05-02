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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { uid: userId, error: authError } = await getUserId();
    
    if (!userId) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Create an update object without the _id field
    const updateData = { ...body };
    delete updateData._id; // Ensure we don't try to save _id into the document
    if (updateData.date) {
        updateData.date = new Date(updateData.date);
    }
    updateData.updatedAt = new Date();

    const docRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .doc(id);

    // Verify the document exists before updating
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await docRef.update(updateData);

    return NextResponse.json({ success: true, _id: id, ...updateData }, { status: 200 });
  } catch (error: any) {
    console.error("PUT Transaction Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { uid: userId, error: authError } = await getUserId();
    
    if (!userId) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 });
    }

    const docRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .doc(id);
      
    // Verify the document exists
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true, message: "Transaction deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE Transaction Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete transaction" }, { status: 500 });
  }
}
