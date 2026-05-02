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
    
    const updateData = { ...body };
    delete updateData._id;
    updateData.updatedAt = new Date();

    const docRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("goals")
      .doc(id);

    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await docRef.update(updateData);

    return NextResponse.json({ success: true, _id: id, ...updateData }, { status: 200 });
  } catch (error: any) {
    console.error("PUT Goal Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update goal" }, { status: 500 });
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
      .collection("goals")
      .doc(id);
      
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true, message: "Goal deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE Goal Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete goal" }, { status: 500 });
  }
}
