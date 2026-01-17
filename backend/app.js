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
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

/* --------------------------------------------------
   CORS
-------------------------------------------------- */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  })
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
    collectionName: "sessions"
  }),
  cookie: {
    maxAge: parseInt(process.env.SESSION_LIFETIME) || 86400000,
    httpOnly: true,
    secure: false, // true only with HTTPS
    sameSite: "lax"
  }
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
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
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
io.on("connection", (socket) => {
  const session = socket.request.session;

  console.log("Socket connected:", socket.id);
  console.log("Session ID:", session?.id);

  // Example: join user room
  if (session?.user?.id) {
    socket.join(`user:${session.user.id}`);
  }

  socket.on("ping", () => {
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* --------------------------------------------------
   START SERVER
-------------------------------------------------- */
server.listen(port, () => {
  console.log(`B2B Platform running on port ${port}`);
});
