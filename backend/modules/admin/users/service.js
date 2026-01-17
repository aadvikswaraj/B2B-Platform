import { User } from "../../../models/model.js";
import bcrypt from "bcrypt";

/**
 * List users with query, pagination, and sorting
 */
export const list = async (match, skip, limit, sort = { createdAt: -1 }) => {
    const [docs, totalCount] = await Promise.all([
        User.find(match)
            .select("-password -__v")
            .populate("adminRole", "roleName")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(match),
    ]);
    return { docs, totalCount };
};

/**
 * Get user by ID with populated role
 */
export const getById = async (id) => {
    return await User.findById(id)
        .select("-password -__v")
        .populate("adminRole", "roleName")
        .lean();
};

/**
 * Update user by ID
 */
export const update = async (id, data) => {
    return await User.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    ).select("-password -__v");
};

/**
 * Delete user by ID
 */
export const remove = async (id) => {
    return await User.findByIdAndDelete(id);
};

/**
 * Create new admin user with hashed password
 */
export const createAdmin = async ({ name, email, password, adminRoleId }) => {
    const hashedPassword = await bcrypt.hash(password, 14);
    const admin = new User({
        name,
        email,
        password: hashedPassword,
        isAdmin: true,
        adminRole: adminRoleId
    });
    await admin.save();
    return admin.toObject();
};

/**
 * Find user by email address
 */
export const findByEmail = async (email) => {
    return await User.findOne({ email }).lean();
};
