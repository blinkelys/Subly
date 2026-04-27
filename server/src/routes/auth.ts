import express, { Router } from "express";
import { Request, Response, NextFunction } from "express";
import session from "express-session";
import { User } from "../models/user";
import { isAdmin } from "../middleware/auth";
import bcrypt from "bcrypt";

const router = express.Router();

router.post(
  "/createAdmin",
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = new User({
        username,
        email,
        password: hashedPassword,
        role: "admin",
      });
      await newAdmin.save();
      res.status(201).json({ message: "Admin user created successfully" });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/getAdmins",
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await User.find({ role: "admin" }).select("-password");
      res.status(200).json(admins);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/getAdmin/:id",
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await User.findOne({
        _id: req.params.id,
        role: "admin",
      }).select("-password");
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      res.status(200).json(admin);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/editAdmin/:id",
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;
      const updateData: any = { username, email };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      const updatedAdmin = await User.findOneAndUpdate(
        { _id: req.params.id, role: "admin" },
        updateData,
        { new: true },
      );
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      res.status(200).json(updatedAdmin);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/deleteAdmin/:id",
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedAdmin = await User.findOneAndDelete({
        _id: req.params.id,
        role: "admin",
      });
      if (!deletedAdmin) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      res.status(200).json({ message: "Admin user deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    req.session.userId = user._id;

    req.session.save((err) => {
      if (err) return next(err);

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role, // 👈 important
        },
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });
    await newUser.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.status(200).json({ message: "Logout successful" });
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

async function generateAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return;
    }
    const adminUsername = process.env.ADMIN_USER || "admin";
    const adminEmail = process.env.ADMIN_EMAIL || `${adminUsername}@gmail.com`;
    const adminPassword = process.env.ADMIN_PASSWORD || "adminpassword";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = new User({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    await newAdmin.save();
    console.log("Default admin user created");
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
}

generateAdmin();

export default router;
