import { Request, Response, NextFunction } from "express";
import "express-session";
import { Types } from "mongoose";

declare module "express-session" {
  interface SessionData {
    userId?: Types.ObjectId;
    csrfSecret?: string;
    csrfToken?: string;
  }
}

// auth middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

export { isAdmin, isAuthorized };
