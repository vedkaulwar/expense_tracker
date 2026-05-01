import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { smsText } = await request.json();

    if (!smsText) {
      return NextResponse.json({ error: "SMS text is required" }, { status: 400 });
    }

    // A basic simulation of parsing an Indian Bank SMS
    // Example: "Rs.500 debited via UPI to Swiggy on 12-10-2023"
    // Example 2: "INR 1200.00 spent on Card ending 1234 at Amazon"
    
    // Very basic regex to simulate extraction
    const amountMatch = smsText.match(/(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

    let merchant = "Unknown";
    const merchantMatch = smsText.match(/(?:to|at)\s+([A-Za-z0-9\s]+?)(?=\s+on|\s*$|\.)/i);
    if (merchantMatch) {
      merchant = merchantMatch[1].trim();
    }

    let type = "expense";
    if (/credited|received/i.test(smsText)) {
      type = "income";
    }

    // Auto category detection
    let category = "Others";
    const lowerMerchant = merchant.toLowerCase();
    if (lowerMerchant.includes("swiggy") || lowerMerchant.includes("zomato") || lowerMerchant.includes("mcdonalds")) category = "Food 🍔";
    else if (lowerMerchant.includes("uber") || lowerMerchant.includes("ola") || lowerMerchant.includes("irctc") || lowerMerchant.includes("petrol")) category = "Travel 🚗";
    else if (lowerMerchant.includes("amazon") || lowerMerchant.includes("flipkart") || lowerMerchant.includes("myntra")) category = "Shopping 🛍️";
    else if (lowerMerchant.includes("jio") || lowerMerchant.includes("airtel") || lowerMerchant.includes("electricity")) category = "Bills 💡";

    let paymentMethod = "UPI";
    if (/card/i.test(smsText)) paymentMethod = "Card";
    else if (/bank transfer|neft|rtgs|imps/i.test(smsText)) paymentMethod = "Bank Transfer";
    
    // Default to saving the transaction
    const parsedData = {
      amount,
      merchant,
      category,
      type,
      source: "sms",
      status: "completed",
      paymentMethod,
      notes: smsText.substring(0, 50) + "..."
    };

    const db = await connectToDatabase();
    if (db) {
      const newTransaction = new Transaction(parsedData);
      await newTransaction.save();
      return NextResponse.json({ success: true, transaction: newTransaction }, { status: 201 });
    } else {
      return NextResponse.json({ success: true, mockMode: true, transaction: parsedData });
    }

  } catch (error) {
    console.error("SMS Parse Error:", error);
    return NextResponse.json({ error: "Failed to parse SMS" }, { status: 500 });
  }
}
