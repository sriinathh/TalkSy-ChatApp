import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import debugRoutes from "./routes/debug.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`  Cookies:`, Object.keys(req.cookies));
  if (req.cookies.jwt) {
    console.log(`  JWT Token present: ${req.cookies.jwt.substring(0, 20)}...`);
  }
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from CLIENT_URL and localhost for development
      // Also allow Cloudinary and other CDNs
      const allowed = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "https://res.cloudinary.com",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
      ].filter(Boolean);

      // Allow requests without origin (native apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in the allowed list
      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS request rejected from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
    maxAge: 86400,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/debug", debugRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
