import { Request, Response, NextFunction } from "express";
import "express-session";
import { Types } from "mongoose";
import { User } from "../models/user";

declare module "express-session" {
  interface SessionData {
    userId?: Types.ObjectId;
    csrfSecret?: string;
    csrfToken?: string;
  }
}

// ✅ Check if logged in
const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// ✅ Check if admin
const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.session.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export { isAuthenticated, isAdmin };