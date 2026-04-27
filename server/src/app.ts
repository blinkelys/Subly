import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Session middleware (per-route, not global)
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 2,
  },
});

app.use(sessionMiddleware);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Database connection
const mongoUser = encodeURIComponent(process.env.MONGODB_USER || "");
const mongoPass = encodeURIComponent(process.env.MONGODB_PASSWORD || "");
const mongoHost = process.env.MONGODB_HOST || "localhost";
const mongoPort = process.env.MONGODB_PORT || "27017";
const mongoDb = process.env.MONGODB_DB || "subly";

mongoose
  .connect(
    `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDb}?authSource=admin`
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
import authRoute from "./routes/auth";
import subscriptionRoutes from './routes/subscriptions'

app.use("/api/auth",  authRoute);
app.use('/api/subscriptions', subscriptionRoutes)

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${HOST} ${PORT}`));
