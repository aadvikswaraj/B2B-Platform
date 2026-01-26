// model.js - Core Mongoose schemas and models
import mongoose from "mongoose";
import dotenv from "dotenv";
import { INDIAN_STATES } from "../data/indianStates.js";
import {
  annualTurnoverOptions,
  businessCategoryOptions,
  employeeCountOptions,
} from "../data/businessDetails.js";

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
    phoneVerified: { type: Boolean, default: false, required: true },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
    },
    isSeller: { type: Boolean, default: false, required: true },
    sellerSuspended: { type: Boolean, default: false, required: true },
    userSuspended: { type: Boolean, default: false, required: true },

    // Balance
    buyleadBalance: { type: Number, default: 0, required: true },

    // Link to business profile
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
    },
    // Link to seller KYC
    sellerKYC: { type: mongoose.Schema.Types.ObjectId, ref: "SellerKYC" },
    isAdmin: { type: Boolean, default: false },
    adminRole: { type: mongoose.Schema.Types.ObjectId, ref: "AdminRole" },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export const adminPermissionsModules = {
  users: ["view", "edit", "delete", "suspend"],
  products: ["view", "edit", "delete", "verify"],
  brands: ["view", "delete", "edit", "verify"],
  orders: ["view", "edit", "delete", "create"],
  rfqs: ["view", "approve", "reject"],
  sellerPanel: ["access"],
  category: ["view", "edit", "delete", "create"],
  adminRoles: ["view", "edit", "delete", "create"],
  content: ["view", "edit"],
  buyRequirements: ["view", "verify", "reject"],
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
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    permissions: {
      type: Object,
    },
  },
  {
    timestamps: true,
  },
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
      enum: {
        values: businessCategoryOptions.map((o) => o.value),
        message: "Invalid business category",
      },
      trim: true,
    },
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
      enum: {
        values: employeeCountOptions.map((o) => o.value),
        message: "Invalid employee count range",
      },
      trim: true,
    },
    annualTurnover: {
      type: String,
      enum: {
        values: annualTurnoverOptions.map((o) => o.value),
        message: "Invalid annual turnover range",
      },
      trim: true,
    },
    // Store customization
    logo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    banners: [
      {
        file: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "File",
          required: true,
        },
        link: { type: String, trim: true },
        title: { type: String, trim: true },
        position: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    highlights: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],

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
        required: true,
      },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectedReason: { type: String, trim: true },
      verifiedAt: { type: Date },
    },
  },
  { timestamps: true },
);

businessProfileSchema.pre("save", function (next) {
  if (
    this.isModified("verification") ||
    this.isModified("verification.status")
  ) {
    this.verification.verifiedAt = new Date();
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
        default: "pending",
        required: true,
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
        default: "pending",
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
        default: "pending",
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
        default: "pending",
      },
      rejectedReason: { type: String, trim: true },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  },
);

sellerKYCSchema.pre("save", function (next) {
  if (this.isModified("pan.status")) {
    this.pan.verifiedAt = new Date();
  }
  if (this.isModified("gstin.status")) {
    this.gstin.verifiedAt = new Date();
  }
  if (this.isModified("bankAccount.status")) {
    this.bankAccount.verifiedAt = new Date();
  }
  if (this.isModified("signature.status")) {
    this.signature.verifiedAt = new Date();
  }
  next();
});

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
  // Optional compression metadata for images
  compression: {
    originalSize: { type: Number },
    compressedSize: { type: Number },
    savings: { type: Number },
    savingsPercent: { type: Number },
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
    required: {
      type: Boolean,
      default: false,
      required: true,
    },
    value: {
      type: {
        type: String,
        required: true,
        enum: [
          "text",
          "number",
          "select",
          "multiselect",
          "date",
          "boolean",
          "range",
        ],
      },
      options: {
        type: Array,
      },
      range: {
        min: { type: Number },
        max: { type: Number },
      },
      maxLength: { type: Number, min: 1 },
    },
    displayOrder: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // No duplicate category names
    },
    // Optional SEO-friendly identifier; we'll auto-generate from name if missing
    slug: {
      type: String,
      trim: true,
      index: { unique: true, sparse: true }, // allow many docs without slug; enforce uniqueness when present
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
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Specification" }],
      default: [],
    },
    acceptOrders: {
      type: Boolean,
      default: true, // Whether orders are accepted in this category
    },
    // Commission configuration (inherits if mode==='inherit')
    commission: {
      mode: {
        type: String,
        enum: ["inherit", "exact", "slab"],
        default: "inherit",
      },
      exact: { type: Number, min: 0, max: 100 }, // percentage 0-100 (validated in hook)
      // Threshold slabs: amount <= upto gets percent commission
      slabs: [
        {
          upto: { type: Number, min: 0 },
          percent: { type: Number, min: 0, max: 100 },
        },
      ],
    },
    depth: { type: Number, default: 0 }, // 0 root, 1 sub, 2 micro
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Validate commission structure before saving (runs for create/update)
// Use a PRE validate hook so we can call next(err) properly. In post hooks, the signature differs.
categorySchema.pre("validate", function (next) {
  const commission = this.commission || {};

  // Validate slab thresholds (upto is strictly increasing, percents 0–100)
  if (commission.mode === "slab") {
    if (!Array.isArray(commission.slabs) || commission.slabs.length < 2) {
      return next(new Error("At least two commission slabs are required"));
    }
    const sorted = [...commission.slabs].sort(
      (a, b) => (a?.upto ?? 0) - (b?.upto ?? 0),
    );
    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i] || {};
      const u = Number(s.upto);
      const p = Number(s.percent);
      if (!Number.isFinite(u) || u < 0) {
        return next(new Error(`Slab ${i + 1}: upto must be a number >= 0`));
      }
      if (!Number.isFinite(p) || p < 0 || p > 100) {
        return next(
          new Error(
            `Slab ${i + 1}: percent must be a number between 0 and 100`,
          ),
        );
      }
      if (i > 0) {
        const prevU = Number(sorted[i - 1].upto);
        if (!(u > prevU)) {
          return next(
            new Error(
              "Invalid commission slabs: 'upto' thresholds must be strictly increasing",
            ),
          );
        }
      }
    }
    // Keep slabs sorted for persistence consistency
    this.commission.slabs = sorted;
    return next();
  }

  // inherit or unknown mode – no checks
  return next();
});

// Auto-generate slug from name if missing (runs alongside commission validation)
function toSlug(str) {
  if (!str) return undefined;
  return String(str)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = toSlug(this.name);
  }
  next();
});

// Pre-save hook to manage depth & ancestors and enforce max depth 2
categorySchema.pre("save", async function (next) {
  if (!this.parentCategory) {
    this.depth = 0;
  } else {
    const parent = await this.constructor
      .findById(this.parentCategory)
      .select("depth commission");
    if (!parent) {
      return next(new Error("Parent category not found"));
    }
    if (parent.depth >= 2) {
      return next(new Error("Maximum category depth (2) exceeded"));
    }
    this.depth = parent.depth + 1;
    // Ensure slabs remain sorted for slab mode
    if (
      this.commission?.mode === "slab" &&
      Array.isArray(this.commission.slabs)
    ) {
      this.commission.slabs.sort((a, b) => (a.upto ?? 0) - (b.upto ?? 0));
    }
  }
  next();
});

// // Virtual to compute effectiveCommission object (resolved inheritance)
// categorySchema.virtual("effectiveCommission").get(function () {
//   if (!this.commission) return null;
//   if (this.commission.mode !== "inherit") return this.commission;
//   // Attempt to read populated ancestors if available, fallback null
//   if (this.populated("ancestors")) {
//     for (let i = this.ancestors.length - 1; i >= 0; i--) {
//       const anc = this.ancestors[i];
//       if (anc?.commission && anc.commission.mode !== "inherit")
//         return anc.commission;
//     }
//   }
//   return this.commission; // unresolved inherit
// });

// Helper: compute percent for a given amount based on a commission object
function _computePercentForAmount(commission, amount) {
  if (!commission) return null;
  if (commission.mode === "exact") return Number(commission.exact) || 0;
  if (commission.mode === "slab" && Array.isArray(commission.slabs)) {
    const sorted = [...commission.slabs].sort(
      (a, b) => (a?.upto ?? 0) - (b?.upto ?? 0),
    );
    for (let i = 0; i < sorted.length; i++) {
      const upto = Number(sorted[i].upto);
      if (Number.isFinite(upto) && amount <= upto)
        return Number(sorted[i].percent) || 0;
    }
    if (sorted.length) {
      return Number(sorted[sorted.length - 1].percent) || 0; // ≥ last.upto
    }
    return 0;
  }
  return null; // inherit or unknown
}

/**
 * Resolve effective commission object for this category (follows inheritance).
 * Returns an object { mode: 'exact'|'slab'|'inherit', exact?, slabs? }
 */
categorySchema.methods.resolveEffectiveCommission = async function () {
  if (this.commission && this.commission.mode !== "inherit")
    return this.commission;
  // Need to look up ancestors to find first non-inherit commission from the top
  if (!Array.isArray(this.ancestors) || this.ancestors.length === 0) {
    return this.commission || null; // likely inherit without resolution
  }
  const Cat = this.model("Category");
  const ancestors = await Cat.find({ _id: { $in: this.ancestors } })
    .select("commission")
    .lean();
  // order by the order in this.ancestors
  const order = this.ancestors.map((id) => String(id));
  ancestors.sort(
    (a, b) => order.indexOf(String(a._id)) - order.indexOf(String(b._id)),
  );
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const c = ancestors[i];
    if (c?.commission && c.commission.mode !== "inherit") return c.commission;
  }
  return this.commission || null;
};

/**
 * Compute commission percent for a specific amount.
 * Inherit is resolved to nearest ancestor; for slab, uses first threshold with amount <= upto, else last percent.
 */
categorySchema.methods.getCommissionPercentForAmount = async function (amount) {
  const eff = await this.resolveEffectiveCommission();
  if (!eff) return null;
  return _computePercentForAmount(eff, Number(amount));
};

const productSpecificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["custom", "existing"],
      required: true,
      trim: true,
    },
    existing: {
      specification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specification",
        required: function () {
          return this.type === "existing";
        },
      },
      value: {
        type: String,
        required: function () {
          return this.type === "existing";
        },
        trim: true,
      },
    },
    custom: {
      key: {
        type: String,
        required: function () {
          return this.type === "custom";
        },
        trim: true,
      },
      value: {
        type: String,
        required: function () {
          return this.type === "custom";
        },
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: { type: String, trim: true, lowercase: true },
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
  },
);

const productPriceHistorySchema = new mongoose.Schema(
  {
    oldPrice: {
      type: {
        type: String,
        required: true,
        enum: ["single", "slab"],
      },
      singlePrice: {
        type: Number,

        default: 0,
        min: 0,
      },
      moq: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      slabs: [
        {
          minQuantity: { type: Number, min: 1 },
          price: { type: Number, min: 0 },
        },
      ],
    },
    newPrice: {
      type: {
        type: String,
        required: true,
        enum: ["single", "slab"],
      },
      singlePrice: {
        type: Number,
        default: 0,
        min: 0,
      },
      moq: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      slabs: [
        {
          minQuantity: { type: Number, min: 1 },
          price: { type: Number, min: 0 },
        },
      ],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  },
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
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    specifications: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: "productSpecification" },
      ],
      default: [],
      validate: [
        {
          validator: function (specs) {
            // Check for duplicate specification names
            const names = specs.map(
              (spec) => spec?.custom?.key || spec?.existing?.specification, // Unique existing specification or custom key
            );
            return new Set(names).size === names.length;
          },
          message: "Specification names must be unique within a product",
        },
      ],
    },
    images: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one image is required",
      },
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    pdf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
    taxPercent: {
      type: Number,
      enum: [0, 5, 12, 18, 40],
      default: 0,
    },
    price: {
      type: {
        type: String,
        required: true,
        enum: ["single", "slab"],
      },
      singlePrice: {
        type: Number,
        // NOTE: Removed conditional required function - it doesn't work with findByIdAndUpdate
        // because `this` refers to the query, not the document
        // Validation should be done in the controller instead
        default: 0,
        min: 0,
      },
      moq: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      slabs: [
        {
          minQuantity: { type: Number, min: 1 },
          price: { type: Number, min: 0 },
        },
      ],
    },

    // Sales Mode: true for orders (direct purchase), false for inquiry only
    isOrder: {
      type: Boolean,
      default: true,
    },

    // Logistics & Packaging
    packagingLevels: [
      {
        level: { type: Number },
        name: { type: String },
        containsQty: { type: Number, default: 1 },
        weight: { type: Number },
        dimensions: {
          l: { type: Number, default: 0 },
          w: { type: Number, default: 0 },
          h: { type: Number, default: 0 },
        },
        isStackable: { type: Boolean, default: false },
        isShippingUnit: { type: Boolean, default: false },
      },
    ],

    logistics: {
      dispatchTime: {
        parcel: {
          type: { type: String, enum: ["single", "slab"], default: "single" },
          days: { type: Number },
          slabs: [{ maxQty: Number, days: Number }],
        },
        freight: {
          type: { type: String, enum: ["single", "slab"], default: "single" },
          days: { type: Number },
          slabs: [{ maxQty: Number, days: Number }],
        },
      },
      originCountry: { type: String },
      packagingDetails: { type: String },
    },

    // Production & Compliance
    production: {
      capacity: { type: String },
    },

    // Cost Support
    support: {
      freight: {
        type: { type: String, enum: ["single", "slab"], default: "single" },
        amount: { type: Number },
        slabs: [{ minQty: Number, amount: Number }],
      },
      paymentFee: {
        type: { type: String, enum: ["single", "slab"], default: "single" },
        percent: {
          type: Number,
          min: 0,
          max: 100,
        },
        slabs: [{ minQty: Number, percent: Number }],
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Moderation metadata for admin product verification
    moderation: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      rejectedReason: { type: String, trim: true },
      updatedAt: { type: Date },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: { type: Date },
    },
    // Draft/Pending Updates for Core Product Info
    pendingUpdates: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: null,
      },
      rejectedReason: { type: String, trim: true },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: { type: Date },
      updates: { type: Object }, // Stores the fields that are waiting for approval
    },
    // Price history relation at productPriceHistorySchema self
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Keep isApproved in sync with moderation.status
productSchema.pre("save", function (next) {
  if (this.isModified("moderation") || this.isModified("moderation.status")) {
    const s = this.moderation?.status;
    this.isApproved = s === "approved" || this.isApproved === true;
    if (this.moderation) this.moderation.updatedAt = new Date();
  }
  next();
});

productSchema.methods.getPriceForQuantity = function (quantity) {
  if (!this.price) return 0;
  if (this.price.type === "single") {
    return this.price.singlePrice || 0;
  } else if (this.price.type === "slab") {
    if (!this.price.slabs || !this.price.slabs.length) return 0;
    // Sort desc by minQuantity
    const sorted = [...this.price.slabs].sort(
      (a, b) => b.minQuantity - a.minQuantity,
    );
    const match = sorted.find((s) => quantity >= s.minQuantity);
    return match ? match.price : sorted[sorted.length - 1].price || 0;
  }
  return 0;
};

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
        "Cannot create a user with the default superadmin email.",
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
  },
);

// Helpful index for fetching addresses by user and filtering hidden ones
addressSchema.index({ user: 1, hidden: 1, createdAt: -1 });

const buyleadQuoteSchema = new mongoose.Schema(
  {
    buyRequirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuyRequirement",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: { type: Number, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Buy Requirement Schema
const buyRequirementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    budget: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    city: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["active", "fulfilled"],
      default: "pending",
    },
    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
      rejectedReason: { type: String, trim: true },
    },

    // Admin assigned tags/labels (e.g. Bulk, Urgent, Export)
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    quotesCount: { type: Number, default: 0, min: 0 },
    quotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BuyLeadQuote" }],
      default: [],
    },
  },
  { timestamps: true },
);

const buyleadPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, required: true, trim: true },
    mrp: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 1 },
    validity: { type: Number, enum: [7, 30, 90, 180, 365], required: true },
    leads: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const buyleadPlanTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuyleadPlan",
      required: true,
    },
    plan: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "INR", trim: true },
    paymentStatus: {
      type: String,
      enum: ["hidden", "pending", "paid", "failed"],
      default: "hidden",
      required: true,
      index: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true },
);

// Inquiry Schema - for buyers to inquire about products
const inquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    message: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Cart Schema - shopping cart for buyers
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

const productInquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        mute: { type: Boolean, default: false },
        block: { type: Boolean, default: false },
        pinned: { type: Boolean, default: false },
        unreadCount: { type: Number, default: 0 },
        tags: [
          {
            text: { type: String, required: true },
            color: { type: String, default: "blue" },
          },
        ],
        notes: { type: String },
      },
    ],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    // Context for the conversation
    context: {
      type: {
        type: String,
        enum: ["direct", "inquiry", "buy_requirement", "order"],
      },
      inquiry: { type: mongoose.Schema.Types.ObjectId, ref: "Inquiry" },
      buyRequirement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BuyRequirement",
      },
      order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
  },
  {
    timestamps: true,
  },
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
    context: {
      type: {
        type: String,
        enum: ["message", "inquiry", "buy_requirement", "order"],
      },
      inquiry: { type: mongoose.Schema.Types.ObjectId, ref: "Inquiry" },
      buyRequirement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BuyRequirement",
      },
      order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
    metadata: { type: Object },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Order schema: represents a product order in the B2B marketplace
// Orders are the business truth - all financial events link to orders
const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    readableId: { type: String, unique: true, index: true, sparse: true },
    // Order items with product details (multi-seller supported)
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        title: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },

        // Seller cost support/discounts per item
        freightSupport: { type: Number, default: 0, min: 0 },
        paymentFeeSupport: { type: Number, default: 0, min: 0 },

        // ITEM LEVEL FULFILMENT (Source of Truth)
        fulfilment: {
          status: {
            type: String,
            enum: [
              "pending",
              "accepted",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ],
            default: "pending",
          },
          dispatchTimeDays: { type: Number, default: 2 }, // Snapshot from product at time of order
          expectedDispatchAt: { type: Date }, // Calculated at creation

          shippedAt: { type: Date },
          deliveredAt: { type: Date },
          cancelledAt: { type: Date },
          cancelReason: { type: String },
        },

        // ITEM LEVEL REFUND
        refund: {
          requested: { type: Boolean, default: false },
          reason: { type: String },
          status: {
            type: String,
            enum: ["pending", "approved", "denied", "forced"],
            default: "pending",
          },
          decidedBy: {
            type: String,
            enum: ["seller", "admin", "none"],
            default: "none",
          },
          refundedAt: { type: Date },
          adminNote: { type: String }, // If forced by admin
        },
      },
    ],
    // Financial breakdown
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    // Seller cost support/discounts (order-level totals)
    totalFreightSupport: { type: Number, default: 0, min: 0 },
    totalPaymentFeeSupport: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR", trim: true },

    // Top-level status is REMOVED. It is now derived.
    // We keep paymentStatus as it is a financial state, not fulfilment.
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      required: true,
      index: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    // Shipping details (embedded copy, not reference)
    shippingAddress: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      addressLine1: { type: String, trim: true },
      addressLine2: { type: String, trim: true },
      landmark: { type: String, trim: true },
      pincode: { type: String, trim: true },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" },
    },

    placedAt: { type: Date, default: Date.now },
    // Derived timestamps can be aggregated from items if needed
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Derived Virtual: Summary Status
orderSchema.virtual("summary").get(function () {
  if (!this.items || this.items.length === 0)
    return { status: "pending", counts: {} };

  const counts = {
    pending: 0,
    accepted: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  this.items.forEach((item) => {
    if (item.fulfilment && item.fulfilment.status) {
      counts[item.fulfilment.status] =
        (counts[item.fulfilment.status] || 0) + 1;
    }
  });

  let status = "placed";
  const totalItems = this.items.length;
  const activeItems = totalItems - counts.cancelled;

  if (activeItems === 0 && counts.cancelled > 0) {
    status = "cancelled";
  } else if (counts.delivered === activeItems && activeItems > 0) {
    status = "delivered";
  } else if (counts.delivered > 0 || counts.shipped > 0) {
    status = "partially_delivered"; // or partially_shipped, sticking to simple logic
  } else if (counts.shipped > 0) {
    status = "shipped";
  } else if (counts.processing > 0) {
    status = "processing";
  } else if (counts.accepted > 0) {
    status = "accepted";
  }

  // Progress stage for UI (0-4)
  // 0: Placed/Pending, 1: Accepted, 2: Processing, 3: Shipped, 4: Delivered
  let progressStage = 0;
  if (status === "delivered") progressStage = 4;
  else if (status === "partially_delivered" || counts.shipped > 0)
    progressStage = 3;
  else if (status === "processing") progressStage = 2;
  else if (status === "accepted") progressStage = 1;

  return {
    status,
    counts,
    progressStage,
  };
});

// Payment schema: represents a payment attempt for an order
// CRITICAL: Payments are ALWAYS linked to orders
// One order can have multiple payments (retries, partial payments, refunds)
const paymentSchema = new mongoose.Schema(
  {
    // Link to order (source of truth for amount)
    for: {
      type: String,
      enum: ["order", "buylead"],
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    buyleadPlanTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuyleadPlanTransaction",
    },

    // Buyer who initiated payment
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Razorpay identifiers
    // WHY: We need both for payment verification and reconciliation
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true, // One Razorpay order per payment
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true, // Only set after payment is initiated
    },

    // Payment amount (stored in rupees for consistency)
    // WHY: Always derived from Order.totalAmount (backend is source of truth)
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
      trim: true,
    },

    // Payment status lifecycle
    // created: Razorpay order created, awaiting payment
    // authorized: Payment authorized but not captured (rare with auto-capture)
    // paid: Payment successful and captured
    // failed: Payment failed (wrong PIN, timeout, etc.)
    // refunded: Payment refunded to buyer
    status: {
      type: String,
      enum: ["created", "authorized", "paid", "failed", "refunded"],
      default: "created",
      required: true,
      index: true,
    },

    // Payment method used (for analytics)
    method: {
      type: String,
      enum: [
        "upi",
        "card",
        "netbanking",
        "wallet",
        "emi",
        "demo-simulated",
        "unknown",
      ],
      default: "unknown",
    },

    // Timestamps for payment lifecycle
    paidAt: { type: Date },
    failedAt: { type: Date },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to update timestamps based on status
paymentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();
    switch (this.status) {
      case "paid":
        if (!this.paidAt) this.paidAt = now;
        break;
      case "failed":
        if (!this.failedAt) this.failedAt = now;
        break;
      case "refunded":
        if (!this.refundedAt) this.refundedAt = now;
        break;
    }
  }
  next();
});

// Export Mongoose models for use in routes/controllers
export const User = mongoose.model("User", userSchema);
export const BusinessProfile = mongoose.model(
  "BusinessProfile",
  businessProfileSchema,
);
export const SellerKYC = mongoose.model("SellerKYC", sellerKYCSchema);
export const Address = mongoose.model("Address", addressSchema);
export const AdminRole = mongoose.model("AdminRole", adminRolesSchema);

export const Brand = mongoose.model("Brand", brandSchema);
export const ProductPriceHistory = mongoose.model(
  "ProductPriceHistory",
  productPriceHistorySchema,
);
export const Product = mongoose.model("Product", productSchema);
export const ProductSpecification = mongoose.model(
  "ProductSpecification",
  productSpecificationSchema,
);

export const OTP = mongoose.model("OTP", otpSchema);
export const File = mongoose.model("File", fileSchema);

export const Category = mongoose.model("Category", categorySchema);

export const Specification = mongoose.model(
  "Specification",
  specificationSchema,
);
export const BuyRequirement = mongoose.model(
  "BuyRequirement",
  buyRequirementSchema,
);
export const Inquiry = mongoose.model("Inquiry", inquirySchema);
export const Cart = mongoose.model("Cart", cartSchema);
export const Conversation = mongoose.model("Conversation", conversationSchema);
export const Message = mongoose.model("Message", messageSchema);
export const ProductInquiry = mongoose.model(
  "ProductInquiry",
  productInquirySchema,
);
export const Order = mongoose.model("Order", orderSchema);
export const Payment = mongoose.model("Payment", paymentSchema);

export const buyleadPlan = mongoose.model("BuyleadPlan", buyleadPlanSchema);
export const buyleadPlanTransaction = mongoose.model(
  "BuyleadPlanTransaction",
  buyleadPlanTransactionSchema,
);

export const buyleadQuote = mongoose.model("BuyleadQuote", buyleadQuoteSchema);
