import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  merchant: string;
  category: string;
  type: "expense" | "income";
  date: Date;
  notes?: string;
  source: "manual" | "sms";
  status: "completed" | "pending_24h_delay";
  paymentMethod: "UPI" | "Cash" | "Card" | "Bank Transfer";
}

const TransactionSchema: Schema = new Schema(
  {
    amount: { type: Number, required: true },
    merchant: { type: String, required: true },
    category: { type: String, required: true, default: "Others" },
    type: { type: String, enum: ["expense", "income"], required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    source: { type: String, enum: ["manual", "sms"], default: "manual" },
    status: { type: String, enum: ["completed", "pending_24h_delay"], default: "completed" },
    paymentMethod: { type: String, enum: ["UPI", "Cash", "Card", "Bank Transfer"], default: "UPI" },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
