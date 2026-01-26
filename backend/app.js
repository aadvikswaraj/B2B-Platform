import "module-alias/register.js";
import "./config/env.js"; // Load env vars FIRST

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import MongoStore from "connect-mongo";
import path from "path";

import { responseTemplate } from "./middleware/responseTemplate.js";
import authRoutes from "./modules/auth/routes.js";
import adminRoutes from "./modules/admin/routes.js";
import catalogRoutes from "./modules/catalog/routes.js";
import sellerRoutes from "./modules/seller/routes.js";
import buyerRoutes from "./modules/buyer/routes.js";
import userRoutes from "./modules/user/routes.js";
import { registerSocketHandlers } from "./socket.js";

const app = express();
const port = 3001;

/* --------------------------------------------------
   HTTP SERVER (Socket.IO attaches to THIS, not Express)
-------------------------------------------------- */
const server = http.createServer(app);

/* --------------------------------------------------
   DATABASE
-------------------------------------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* --------------------------------------------------
   CORS
-------------------------------------------------- */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

/* --------------------------------------------------
   STATIC FILES
-------------------------------------------------- */
const __dirname = path.resolve();
app.use("/public", express.static(path.join(__dirname, "public")));

/* --------------------------------------------------
   SESSION (important for Socket.IO auth later)
-------------------------------------------------- */
const sessionMiddleware = session({
  name: process.env.SESSION_NAME || "sid",
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: parseInt(process.env.SESSION_LIFETIME) || 86400000,
    httpOnly: true,
    secure: false, // true only with HTTPS
    sameSite: "lax",
  },
});

app.use(sessionMiddleware);

/* --------------------------------------------------
   BODY PARSER (skip for file upload route)
-------------------------------------------------- */
app.use((req, res, next) => {
  // Skip JSON parsing for file upload endpoint (uses raw body)
  if (req.path === "/user/file/upload" && req.method === "POST") {
    return next();
  }
  express.json()(req, res, next);
});

/* --------------------------------------------------
   RESPONSE TEMPLATE
-------------------------------------------------- */
/* --------------------------------------------------
   INJECT IO INSTANCE (Must be done before routes)
-------------------------------------------------- */
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(responseTemplate);

/* --------------------------------------------------
   ROUTES
-------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("Welcome to B2B Platform Backend");
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/catalog", catalogRoutes);
app.use("/seller", sellerRoutes);
app.use("/buyer", buyerRoutes);
app.use("/user", userRoutes);
/* --------------------------------------------------
   SOCKET.IO INITIALIZATION
-------------------------------------------------- */
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

/* --------------------------------------------------
   SHARE EXPRESS SESSION WITH SOCKET.IO
-------------------------------------------------- */
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

/* --------------------------------------------------
   SOCKET EVENTS
-------------------------------------------------- */

registerSocketHandlers(io);

/* --------------------------------------------------
   START SERVER
-------------------------------------------------- */
server.listen(port, () => {
  // Server initialized - Port conflict fixed
  console.log(`B2B Platform running on port ${port}`);
});

const shutdown = () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
