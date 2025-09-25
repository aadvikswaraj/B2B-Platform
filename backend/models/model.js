// model.js - Core Mongoose schemas and models
import mongoose from "mongoose";
import dotenv from "dotenv";
import { INDIAN_STATES } from "../data/indianStates.js";
import {
  annualTurnoverOptions,
  businessCategoryOptions,
  employeeCountOptions,
} from "../data/businessDetails.js";
dotenv.config();

// User schema: stores user credentials, roles, and main personal info
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
    phoneVerified: { type: Boolean, default: false },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    isSeller: { type: Boolean, default: false },
    sellerSuspended: { type: Boolean, default: false },
    userSuspended: { type: Boolean, default: false },
    // Link to business profile
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
    },
    // Link to seller KYC
    sellerKYC: { type: mongoose.Schema.Types.ObjectId, ref: "SellerKYC" },
    isAdmin: { type: Boolean, default: false },
    adminRole: { type: mongoose.Schema.Types.ObjectId, ref: "AdminRole" },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const adminPermissionsModules = {
  users: ["view", "edit", "delete", "suspend"],
  products: ["view", "edit", "delete", "verify"],
  orders: ["view", "edit", "delete", "create"],
  rfqs: ["view", "approve", "reject"],
  sellerPanel: ["access"],
  category: ["view", "edit", "delete", "create"],
  adminRoles: ["view", "edit", "delete", "create"],
  content: ["view", "edit"],
};

const adminRolesSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// BusinessProfile schema: company, GSTIN, PAN, business type, address (ref), website, description, verification, completeness
const businessProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, trim: true },
    businessCategory: {
      type: String,
      enum: businessCategoryOptions.map((o) => o.value),
      trim: true,
    },
    contactPersonName: { type: String, trim: true },
    gstin: {
      type: String,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GSTIN format",
      ],
      trim: true,
    },
    pan: {
      type: String,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
      trim: true,
    },
    address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" }, // based on GST address in case of sellers
    description: { type: String, trim: true },
    designation: { type: String, trim: true },
    ceo: { type: String, trim: true },
    employeeCount: {
      type: String,
      enum: employeeCountOptions.map((o) => o.value),
      trim: true,
    },
    annualTurnover: {
      type: String,
      enum: annualTurnoverOptions.map((o) => o.value),
      trim: true,
    },
    // Other optional fields
    website: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
        "Invalid website URL",
      ],
      trim: true,
    },
    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Update verification timestamp when status changes
businessProfileSchema.pre("save", function (next) {
  if (
    this.isModified("verification") ||
    this.isModified("verification.status")
  ) {
    this.verification = this.verification || {};
    this.verification.updatedAt = new Date();
  }
  next();
});

const sellerKYCSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // businessDetails removed; now in BusinessProfile
    pickupAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    pan: {
      pan: {
        type: String,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
        required: true,
        trim: true,
      },
      file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
      },
      rejectedReason: { type: String, trim: true },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: { type: Date },
    },
    gstin: {
      gstin: {
        type: String,
        required: true,
        match: [
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
          "Invalid GSTIN format",
        ],
        trim: true,
      },
      file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
      },
      rejectedReason: { type: String, trim: true },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: { type: Date },
    },
    bankAccount: {
      accountNumber: {
        type: String,
        trim: true,
        match: [/^[0-9]{9,18}$/, "Invalid account number"],
      },
      ifsc: {
        type: String,
        trim: true,
        match: [/^[A-Z]{4}[0-9]{7}$/, "Invalid IFSC code"],
      },
      accountHolder: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branch: { type: String, trim: true },

      cancelledCheque: { type: mongoose.Schema.Types.ObjectId, ref: "File" }, // File ref for cancelled  cheque

      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
      },
      rejectedReason: { type: String, trim: true },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: { type: Date },
    },
    signature: {
      file: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
      },
      rejectedReason: { type: String, trim: true },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
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
      default: [],
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
    },
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
      trim: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // For subcategories (self-relation)
      default: null,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File", // Linking to your File schema
    },
    specifications: {
      type: [specificationSchema],
      default: [],
    },
    // Commission configuration (inherits if mode==='inherit')
    commission: {
      mode: {
        type: String,
        enum: ["inherit", "exact", "slab"],
        default: "inherit",
      },
      exact: { type: Number, min: 0 }, // percentage 0-100 (validation optional)
      slabs: [
        {
          min: { type: Number, min: 0 },
          max: { type: Number, min: 0 },
          percent: { type: Number, min: 0 },
        },
      ],
    },
    // Ancestor chain (max length 2 for category -> sub -> micro)
    ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    depth: { type: Number, default: 0 }, // 0 root, 1 sub, 2 micro
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for management / search operations
// Unique index on slug already implied by unique:true but we add explicit for clarity
categorySchema.index({ slug: 1 }, { unique: true });
// Parent & depth queries (tree fetching, filtering by depth)
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ depth: 1 });
// Text search across common fields (fallback if regex search becomes slow)
try {
  categorySchema.index({ name: "text", slug: "text", description: "text" });
} catch (e) {
  // Ignore if index creation fails at runtime; Mongoose will surface elsewhere
}

// Pre-save hook to manage depth & ancestors and enforce max depth 2
categorySchema.pre("save", async function (next) {
  if (!this.parentCategory) {
    this.ancestors = [];
    this.depth = 0;
  } else {
    const parent = await this.constructor
      .findById(this.parentCategory)
      .select("ancestors depth commission");
    if (!parent) {
      return next(new Error("Parent category not found"));
    }
    if (parent.depth >= 2) {
      return next(new Error("Maximum category depth (2) exceeded"));
    }
    this.ancestors = [...parent.ancestors, parent._id];
    this.depth = parent.depth + 1;
    // Inherit commission if mode is inherit and parent has commission resolution
    if (this.commission?.mode === "inherit") {
      // simply omit exact/slabs; effective resolution handled in virtual
      this.commission.exact = undefined;
      this.commission.slabs = undefined;
    }
  }
  next();
});

// Virtual to compute effectiveCommission object (resolved inheritance)
categorySchema.virtual("effectiveCommission").get(function () {
  if (!this.commission) return null;
  if (this.commission.mode !== "inherit") return this.commission;
  // Attempt to read populated ancestors if available, fallback null
  if (this.populated("ancestors")) {
    for (let i = this.ancestors.length - 1; i >= 0; i--) {
      const anc = this.ancestors[i];
      if (anc?.commission && anc.commission.mode !== "inherit")
        return anc.commission;
    }
  }
  return this.commission; // unresolved inherit
});

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
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Verification status for brand authenticity
    kyc: {
      file: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      rejectedReason: { type: String, trim: true },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isGeneric: { type: Boolean, default: false },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: function () {
        return !this.isGeneric;
      },
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
        },
      ],
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
    isApproved: {
      type: Boolean,
      default: false,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
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
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    trim: true,
  },
  data: {
    type: Object, // Stores user data for verification
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "1h", // Automatically delete OTP after 1 hour
  },
});

// DEFAULT_SUPERADMIN can be provided as JSON string in env, e.g. {"name":"Root","email":"root@example.com"}
let DEFAULT_SUPERADMIN = null;
if (process.env.DEFAULT_SUPERADMIN) {
  try {
    DEFAULT_SUPERADMIN = JSON.parse(process.env.DEFAULT_SUPERADMIN);
  } catch (err) {
    console.warn("DEFAULT_SUPERADMIN env is not valid JSON; ignoring.");
  }
}

// Prevent creation of DEFAULT_SUPERADMIN user
if (DEFAULT_SUPERADMIN?.email) {
  userSchema.pre("save", function (next) {
    if (this.email === DEFAULT_SUPERADMIN.email) {
      const error = new Error(
        "Cannot create a user with the default superadmin email."
      );
      return next(error);
    }
    next();
  });
}

// Middleware to handle default superadmin email searches
if (DEFAULT_SUPERADMIN?.email) {
  userSchema.pre(["find", "findOne"], function () {
    const conditions = this.getQuery();
    if (conditions.email === DEFAULT_SUPERADMIN.email) {
      // Short-circuit by injecting a synthetic result post exec
      this._defaultSuperAdminQuery = true;
    }
  });

  // Wrap exec to inject synthetic superadmin
  const patchExec = (queryProto) => {
    const origExec = queryProto.exec;
    // Wrap exec but only inject synthetic result when the query targets the User model
    queryProto.exec = async function () {
      const res = await origExec.apply(this, arguments);
      try {
        // Only act when this._defaultSuperAdminQuery was set by the userSchema pre hook
        // and the query's model is "User". This prevents side-effects on other models.
        if (
          this._defaultSuperAdminQuery &&
          this.model &&
          this.model.modelName === "User"
        ) {
          if (Array.isArray(res))
            return [
              {
                _id: "default-superadmin",
                isAdmin: true,
                isSuperAdmin: true,
                ...DEFAULT_SUPERADMIN,
              },
            ];
          if (!res)
            return {
              _id: "default-superadmin",
              isAdmin: true,
              isSuperAdmin: true,
              ...DEFAULT_SUPERADMIN,
            };
        }
      } catch (err) {
        // If anything goes wrong here, just return the original result to avoid breaking queries
        return res;
      }
      return res;
    };
  };
  patchExec(mongoose.Query.prototype);
}

const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: INDIAN_STATES.map((state) => state.code),
      required: true,
      trim: true,
    },
    country: {
      type: String,
      enum: ["India"], // Add more countries as needed
      required: true,
      default: "India",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    isDefault: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Helpful index for fetching addresses by user and filtering hidden ones
addressSchema.index({ user: 1, hidden: 1, createdAt: -1 });

// Export Mongoose models for use in routes/controllers
export const User = mongoose.model("User", userSchema);
export const BusinessProfile = mongoose.model(
  "BusinessProfile",
  businessProfileSchema
);
export const SellerKYC = mongoose.model("SellerKYC", sellerKYCSchema);
export const Address = mongoose.model("Address", addressSchema);
export const AdminRole = mongoose.model("AdminRole", adminRolesSchema);

export const Brand = mongoose.model("Brand", brandSchema);
export const Product = mongoose.model("Product", productSchema);

export const OTP = mongoose.model("OTP", otpSchema);
export const File = mongoose.model("File", fileSchema);

export const Category = mongoose.model("Category", categorySchema);

export const Specification = mongoose.model(
  "Specification",
  specificationSchema
);
