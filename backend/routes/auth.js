import express from "express";
import { OTP, User } from "../models/model.js";
import bcrypt from "bcrypt";
import { generateOTPOf6Digits, makeLoggedIn } from "../utils/auth.js";
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      makeLoggedIn(req, user);
      res.locals.response.message = "Login successful";
    } else {
      res.locals.response.success = false;
      res.locals.response.message = "Invalid password";
    }
  } else {
    res.locals.response.success = false;
    res.locals.response.message = "User not found";
  }
  res.json(res.locals.response);
});

router.get("/loggedin-status", async (req, res) => {
  res.locals.response.data.isLoggedIn = res.locals.isLoggedIn;
  res.locals.response.message = res.locals.isLoggedIn ? "User is logged in" : "User is not logged in";
  res.json(res.locals.response);
});

router.post("/verify-email", async (req, res) => {
  const { action, name, email, phone, password, otp } = req.body;
  if (action === "send-verification") {
    let generatedOtp = generateOTPOf6Digits();
  const hashedPassword = await bcrypt.hash(password, 14);
  const newOtp = await OTP.create({ email, data: { name, phone, password: hashedPassword }, otp: generatedOtp });
    res.locals.response.success = true;
    res.locals.response.message = "Verification email sent";
  } else if (action === "verify-otp") {
  const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (otpRecord && otpRecord.otp == otp) {
      res.locals.response.success = true;
      res.locals.response.data.key = otpRecord._id;
      res.locals.response.message = "Email verified successfully";
    } else {
      res.locals.response.success = false;
      res.locals.response.message = "Invalid OTP";
    }
  }
  else{
    res.locals.response.success = false;
    res.locals.response.message = "Invalid action";
  }
  return res.json(res.locals.response);
});

router.post("/signup", async (req, res) => {
  const { key } = req.body;
  const otpRecord = await OTP.findOne({ _id: key });
  if (otpRecord) {
    let user = await User.findOne({ email: otpRecord.email });
    if (user) {
      res.locals.response.success = false;
      res.locals.response.message = "Email already exists";
    }
    else{
      try {
        user = new User({ ...otpRecord.data, email: otpRecord.email });
        user = await user.save();
        res.locals.response.message = "User created successfully";
      } catch (error) {
        res.locals.response.success = false;
        res.locals.response.message = "User creation failed";
      }
      makeLoggedIn(req, user);
    }
  } else {
    res.locals.response.success = false;
    res.locals.response.message = "Expired otp";
  }
  return res.json(res.locals.response);
});

router.post("/seller-registration", async (req, res) => {
  const { email, password, companyName, gstin, bankDetails } = req.body;
  // Validate and process the seller registration data
  // ...
  res.json(res.locals.response);
});

export default router;