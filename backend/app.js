import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import { responseTemplate } from './middleware/responseTemplate.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/seller/index.js';
const app = express();
const port = 3001;

// MongoDB connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/b2b_platform";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

dotenv.config();
// Enable CORS for frontend running on localhost:5173
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // Allow cookies/auth headers to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use('public', express.static('public'));

// Session configuration
app.use(session({
  name: process.env.SESSION_NAME || 'sid',
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_LIFETIME) || 86400000, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Parse incoming JSON requests
app.use(express.json());

// Custom middleware to standardize API responses
app.use(responseTemplate);

app.get('/', (req, res) => {
  res.send('Welcome to B2B Platform Backend');
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.listen(port, () => {
  console.log(`B2B Platform App listening on port ${port}`);
});