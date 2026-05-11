import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  currency: string; // e.g., "USD", "EUR", "GBP"
  country: string; // e.g., "US", "DE", "GB"
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      default: "user",
      enum: ["user", "admin"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "INR", "MXN", "BRL", "SGD"],
    },
    country: {
      type: String,
      default: "US",
      enum: ["US", "DE", "GB", "JP", "CA", "AU", "CH", "IN", "MX", "BR", "SG"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const User = model<IUser>("User", userSchema);
