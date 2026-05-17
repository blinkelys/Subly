import express, { Router, Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { EmailService } from "../services/emailService";
import { isAdmin } from "../middleware/auth";
import bcrypt from "bcrypt";

const router = express.Router();

// All admin routes require admin role
router.use(isAdmin);

// Get all users
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select("-password -passwordResetToken -passwordResetExpires -emailVerificationCode -emailVerificationExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select("-password -passwordResetToken -passwordResetExpires -emailVerificationCode -emailVerificationExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, currency, country, role } = req.body;

    // Prevent admin from demoting themselves
    if (req.params.id === req.session.userId?.toString() && role !== "admin") {
      return res.status(400).json({ message: "Cannot change your own admin role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, currency, country, role },
      { new: true }
    ).select("-password -passwordResetToken -passwordResetExpires -emailVerificationCode -emailVerificationExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.session.userId?.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Send password reset email to user
router.post("/users/:id/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const recoveryToken = EmailService.generateRecoveryToken();
    user.passwordResetToken = recoveryToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const emailSent = await EmailService.sendPasswordRecoveryEmail(
      user.email,
      user.username,
      recoveryToken
    );

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;