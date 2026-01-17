import * as authService from "./service.js";
import { sendResponse } from "../../middleware/responseTemplate.js";
import { makeLoggedIn } from "../../utils/auth.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);

    if (!user) {
      res.locals.response = {
        success: false,
        message: "User not found",
        status: 404,
      };
    } else {
      const match = await authService.comparePassword(password, user.password);
      if (match) {
        await makeLoggedIn(req, user);
        res.locals.response = {
          success: true,
          message: "Login successful",
          status: 200,
          data: {
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              isAdmin: user.isAdmin,
              isSeller: user.isSeller,
            },
          },
        };
      } else {
        res.locals.response = {
          success: false,
          message: "Invalid password",
          status: 401,
        };
      }
    }
  } catch (error) {
    res.locals.response = {
      success: false,
      message: "Failed to login: " + error.message || "Unknown error",
      status: 500,
    };
  }
  return sendResponse(res);
};

export const getLoggedInStatus = async (req, res) => {
  try {
    res.locals.response = {
      success: true,
      message: res.locals.isLoggedIn
        ? "User is logged in"
        : "User is not logged in",
      status: 200,
      data: {
        isLoggedIn: res.locals.isLoggedIn,
        user: req.user || null,
      },
    };
  } catch (error) {
    console.error("Error in getLoggedInStatus:", error);
    res.locals.response = {
      success: false,
      message: "Failed to get logged in status: " + error.message || "Unknown error",
      status: 500,
    };
  }
  return sendResponse(res);
};

export const verifyEmail = async (req, res) => {
  try {
    const { action, name, email, phone, password, otp } = req.body;

    if (action === "send-verification") {
      await authService.createOTP({ email, name, phone, password });
      res.locals.response = {
        success: true,
        message: "Verification email sent",
        status: 200,
      };
    } else if (action === "verify-otp") {
      const otpRecord = await authService.verifyOTP(email, otp);
      if (otpRecord) {
        res.locals.response = {
          success: true,
          message: "Email verified successfully",
          status: 200,
          data: {
            key: otpRecord._id,
          },
        };
      } else {
        res.locals.response = {
          success: false,
          message: "Invalid OTP",
          status: 400,
        };
      }
    }
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.locals.response = {
      success: false,
      message:
        `Failed to ${
          action === "send-verification"
            ? "send verification email"
            : "verify OTP"
        }` + error.message || "Unknown error",
      status: 500,
    };
  }
  return sendResponse(res);
};

export const signup = async (req, res) => {
  try {
    const { key } = req.body;
    const user = await authService.createUserFromOTP(key);
    await makeLoggedIn(req, user);
    res.locals.response = {
      success: true,
      message: "User created successfully",
      status: 201,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: error.message === "Expired otp" ? "Expired OTP" :"Failed to signup: "+ error.message || "Unknown error",
      status:
        error.message === "Expired otp"
          ? 400
          : error.message === "Email already exists"
          ? 409
          : 500,
    };
  }
  return sendResponse(res);
};
