// model.js - Defines Mongoose schemas and models for the BlogApp
// Includes User, Blog, Comment, OTP, and Contact schemas

import { json } from "express";
import mongoose from "mongoose";

// User schema: stores user credentials, roles, and metadata
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Email is invalid"], // Email validation
      unique: true,
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
    sellerProfile: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const adminPermissionsTypes = {
  users:['view', 'edit', 'delete', 'suspend'],
  products:['view', 'edit', 'delete', 'approve', 'reject'],
  orders:['view', 'edit', 'delete', 'create'],
  rfqs:['view', 'approve', 'reject'],
  sellerPanel:['access'],
  category:['view', 'edit', 'delete', 'create'],
  adminRoles:['view', 'edit', 'delete', 'create'],
  content: ['view', 'edit']
}

const adminRolesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleName: {
      type: String,
      required: true
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: Object
    }
  },
  {
    timestamps: true,
  }
);

// User schema: stores user credentials, roles, and metadata
const sellerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    gstin: {
      type: String,
      required: true,
      trim: true,
    },
    gstProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "gstProfile",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const gstProfileSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    gstRegistrationDate: {
      type: Date,
    },
    ownershipType: {
      type: String,
      trim: true,
    },
    primaryBusinessType: {
      type: String,
      trim: true,
    },
    secondaryBusiness: {
      type: String,
      trim: true,
    },
    annualTurnover: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
    trim: true,
  },
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  relativePath: {
    type: String,
    required: true,
    trim: true,
  },
  mimeType: {
    type: String,
    required: true,
    trim: true,
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

const specificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
      enum: ["select", "radio", "text", "custom"],
    },
    options: {
      type: Array,
      default: []
    },
    isSearchable: {
      type: Boolean,
      default: false,
    },
    isComparable: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // No duplicate category names
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // SEO-friendly URL identifier
    },
    description: {
      type: String,
      trim: true
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // For subcategories (self-relation)
      default: null
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File" // Linking to your File schema
    },
    specifications: {
      type: [specificationSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

const productSpecificationSchema = new mongoose.Schema(
  {
    specification: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      type: [productSpecificationSchema],
      default: [],
      validate: [
        {
          validator: function (specs) {
            // Check for duplicate specification names
            const names = specs.map((spec) => spec.specification);
            return new Set(names).size === names.length;
          },
          message: "Specification names must be unique within a product",
        }
      ]
    },
    images: [fileSchema],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      trim: true,
    },
    minOrderQuantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "active", "inactive", "rejected"],
      default: "draft",
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// OTP schema: stores OTPs for signup verification
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: Object, // Stores user data for verification
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1h' // Automatically delete OTP after 1 hour
  }
});

// Export Mongoose models for use in routes/controllers
export const User = mongoose.model("User", userSchema);

export const Seller = mongoose.model("Seller", sellerSchema);
export const GSTProfile = mongoose.model("GSTProfile", gstProfileSchema);
export const Product = mongoose.model("Product", productSchema);

export const OTP = mongoose.model("OTP", otpSchema);
export const File = mongoose.model("File", fileSchema);

export const Category = mongoose.model("Category", categorySchema);