import express from "express";
import { OTP, User } from "../models/model.js";
import bcrypt from "bcrypt";
import { makeLoggedIn } from "../utils/auth.js";
const router = express.Router();

export default router;

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {
      makeLoggedIn(user, res);
      res.locals.response.success = true;
      res.locals.response.message = "Login successful";
    } else {
      res.locals.response.message = "Invalid password";
    }
  } else {
    res.locals.response.message = "User not found";
  }
  res.json(res.locals.response);
});

router.post("/verify-email", async (req, res) => {
  const { action, name, email, phone, password, otp } = req.body;
  if (action === "send-verification") {
    await OTP.create({ data: { email, name, phone, password }, otp });
    res.locals.response.success = true;
    res.locals.response.message = "Verification email sent";
  } else if (action === "verify") {
    // Logic to verify email
    const otpRecord = await OTP.findOne({ "data.email": email, otp });
    if (otpRecord) {
      res.locals.response.success = true;
      res.locals.response.data.key = otpRecord._id;
      res.locals.response.message = "Email verified successfully";
      otpRecord.remove(); // Remove OTP after successful verification
    } else {
      res.locals.response.success = false;
      res.locals.response.message = "Invalid OTP";
    }
  }
  return res.json(res.locals.response);
});

router.post("/signup", async (req, res) => {
  const { name, email, phone, password, key } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.locals.response.success = false;
    res.locals.response.message = "Email already exists";
  } else if (key) {
    let otpObj = await OTP.findOne({ _id: key });
    if (otpObj && otpObj.data.email === email && otpObj.createdAt > Date.now() - 3600000) {
      if ( otpObj.data.otp === otp) {
        const hashedPassword = await bcrypt.hash(password, 14);
        user = new User({ name, email, phone, passwordHash: hashedPassword });
        await user.save();
        res.locals.response.success = true;
        res.locals.response.message = "User created successfully";
        makeLoggedIn(user, res);
      }
      else{
        res.locals.response.message = "Invalid OTP";
      }
    }
    else{
      res.locals.response.success = false;
      res.locals.response.message = "OTP expired";
    }
  }
  return res.json(res.locals.response);
});