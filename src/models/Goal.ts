import mongoose, { Schema, Document } from "mongoose";

export interface IGoal extends Document {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  icon?: string;
  status: "active" | "completed";
}

const GoalSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    icon: { type: String, default: "🎯" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
