import express, { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { EmailService } from "../services/emailService";
import { getSupportedCurrencies } from "../utils/currencies";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrUsername, password, rememberMe } = req.body;

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

    if (rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
    } else {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 2;
    }

    req.session.save((err) => {
      if (err) return next(err);

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          currency: user.currency,
          country: user.country,
        },
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = EmailService.generateVerificationToken();

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: "user",
        currency: "USD",
        country: "US",
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      await newUser.save();

      // Send verification email
      const emailSent = await EmailService.sendVerificationEmail(
        email,
        username,
        verificationToken
      );

      if (!emailSent) {
        console.error("Failed to send verification email");
        // Don't fail registration if email fails, but log it
      }

      return res.status(201).json({
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          currency: newUser.currency,
          country: newUser.country,
          emailVerified: newUser.emailVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

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

    res.status(200).json({
      ...user.toObject(),
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/settings",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { currency, country } = req.body;

      const user = await User.findByIdAndUpdate(
        req.session.userId,
        { currency, country },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Settings updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/currencies",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currencies = getSupportedCurrencies();
      res.status(200).json(currencies);
    } catch (error) {
      next(error);
    }
  }
);

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

// Currency conversion endpoints
router.get(
  "/exchange-rates",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { getAllExchangeRates } = await import("../services/currencyService");
      const rates = await getAllExchangeRates();
      res.status(200).json({ rates, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/convert",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;

      if (!amount || !fromCurrency || !toCurrency) {
        return res
          .status(400)
          .json({
            message: "amount, fromCurrency, and toCurrency are required",
          });
      }

      const { convertCurrency } = await import(
        "../services/currencyService"
      );
      const converted = await convertCurrency(amount, fromCurrency, toCurrency);

      res.status(200).json({
        original: { amount, currency: fromCurrency },
        converted: { amount: converted, currency: toCurrency },
        rate: converted / amount,
      });
    } catch (error) {
      next(error);
    }
  }
);

generateAdmin();

export default router;
