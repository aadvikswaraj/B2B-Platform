import { OTP, User } from "../../models/model.js";
import bcrypt from "bcrypt";
import { generateOTPOf6Digits } from "../../utils/auth.js";

/**
 * Find user by email with populated adminRole
 */
export const findUserByEmail = async (email) => {
    return await User.findOne({ email }).select("+password").populate("adminRole");
};

/**
 * Compare plain text password with hashed password
 */
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Create OTP record for email verification
 */
export const createOTP = async ({ email, name, phone, password }) => {
    const generatedOtp = generateOTPOf6Digits();
    console.log("[DEV] Your OTP is", generatedOtp);
    const hashedPassword = await bcrypt.hash(password, 14);
    await OTP.create({
        email,
        data: { name, phone, password: hashedPassword },
        otp: generatedOtp,
    });
    return generatedOtp;
};

/**
 * Verify OTP for email
 */
export const verifyOTP = async (email, otp) => {
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (otpRecord && otpRecord.otp == otp) {
        return otpRecord;
    }
    return null;
};

/**
 * Create user from verified OTP record
 * Throws error if OTP expired or email already exists
 */
export const createUserFromOTP = async (key) => {
    const otpRecord = await OTP.findOne({ _id: key });
    if (!otpRecord) throw new Error("Expired otp");

    try {
        const user = await User.create({
            ...otpRecord.data,
            email: otpRecord.email,
        });
        return user;
    } catch (error) {
        if (error.code === 11000) throw new Error("Email already exists");
        throw error;
    }
};
