// model.js - Defines Mongoose schemas and models for the BlogApp
// Includes User, Blog, Comment, OTP, and Contact schemas

import { json } from "express";
import mongoose from "mongoose";

// User schema: stores user credentials, roles, and metadata
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, "Email is invalid"], // Email validation
    unique: true,
  },
  isSeller: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// User schema: stores user credentials, roles, and metadata
const sellerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  gstin: {
    type: String,
    required: true,
  },
  gstProfile:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"gstProfile",
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  relativePath: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    unique: true, // Unique identifier for blog
  },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
  content: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    required: true,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Comment schema: stores comments for blog posts
const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // references the User model
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// OTP schema: stores OTPs for signup verification
const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  data: {
    type: Object, // Stores user data for verification
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Contact schema: stores contact form submissions
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    match: ["^(+91[-s]?)?[0]?(91)?[789]d{9}$", "Phone no. is invalid"], // Indian phone validation
    required: true,
  },
  purpose: {
    type: Object,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export Mongoose models for use in routes/controllers
export const userModel = mongoose.model("User", userSchema);
export const fileModel = mongoose.model("File", fileSchema);
export const blogModel = mongoose.model("Blog", blogSchema);
export const commentModel = mongoose.model("Comment", commentSchema);
export const otpModel = mongoose.model("Otp", otpSchema);
export const contactModel = mongoose.model("Contact", contactSchema);
