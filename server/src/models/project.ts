import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IProject>("Project", ProjectSchema);
