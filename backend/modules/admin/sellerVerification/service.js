import { User, SellerKYC, BusinessProfile } from "../../../models/model.js";

/**
 * List seller verifications with search and filters
 */
export const list = async (query, search, statusFilter, skip, limit, sort = { createdAt: -1 }) => {
    const kycs = await SellerKYC.find(query)
        .populate([
            { path: "pan.file", model: "File" },
            { path: "gstin.file", model: "File" },
            { path: "signature.file", model: "File" },
            { path: "bankAccount.cancelledCheque", model: "File" },
        ])
        .lean();

    const userIds = kycs.map(k => k.user);

    // Search in users
    const userQuery = { _id: { $in: userIds } };
    if (search) {
        userQuery.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ];
    }
    const users = await User.find(userQuery)
        .select("name email phone isSeller userSuspended createdAt")
        .lean();

    const profiles = await BusinessProfile.find({ user: { $in: userIds } })
        .select("user businessCategory employeeCount annualTurnover contactPersonName verification")
        .lean();

    // Map for quick lookup
    const userById = new Map(users.map(u => [String(u._id), u]));
    const profileByUser = new Map(profiles.map(p => [String(p.user), p]));

    // Combine data
    let docs = kycs.map(kyc => {
        const user = userById.get(String(kyc.user));
        if (search && !user) return null; // Skip if search filtered out user

        const profile = profileByUser.get(String(kyc.user)) || null;

        // Compute verification status from KYC
        const statuses = [
            kyc?.pan?.status,
            kyc?.gstin?.status,
            kyc?.signature?.status,
            kyc?.bankAccount?.status,
            profile?.verification?.status
        ].filter(Boolean);
        
        let verificationStatus = "pending";
        if (statuses.includes("rejected")) verificationStatus = "rejected";
        else if (statuses.length > 0 && statuses.every(s => s === "verified")) verificationStatus = "verified";

        return {
            user: user || null,
            profile,
            kyc,
            verificationStatus,
        };
    }).filter(Boolean);

    // Filter by status
    if (statusFilter) {
        docs = docs.filter(d => d.verificationStatus === statusFilter);
    }

    // Sort
    docs.sort((a, b) => new Date(b.user?.createdAt || 0) - new Date(a.user?.createdAt || 0));

    const totalCount = docs.length;
    const paged = docs.slice(skip, skip + limit);

    return { docs: paged, totalCount };
};

export const getById = async (userId) => {
    const user = await User.findById(userId)
        .select("name email phone isSeller userSuspended createdAt")
        .lean();
    
    if (!user) return null;

    const kyc = await SellerKYC.findOne({ user: userId })
        .populate([
            { path: "pan.file", model: "File" },
            { path: "gstin.file", model: "File" },
            { path: "signature.file", model: "File" },
            { path: "bankAccount.cancelledCheque", model: "File" },
            { path: "pickupAddress", model: "Address" },
        ])
        .lean();

    const profile = await BusinessProfile.findOne({ user: userId }).lean();

    if (!kyc) return null;

    // Compute verification status
    const statuses = [
        kyc?.pan?.status,
        kyc?.gstin?.status,
        kyc?.signature?.status,
        kyc?.bankAccount?.status,
        profile?.verification?.status
    ].filter(Boolean);
    
    let verificationStatus = "pending";
    if (statuses.includes("rejected")) verificationStatus = "rejected";
    else if (statuses.length > 0 && statuses.every(s => s === "verified")) verificationStatus = "verified";

    return { user, kyc, profile, verificationStatus };
};

export const getUserById = async (id) => {
    return await User.findById(id)
        .select("name email phone isSeller userSuspended createdAt")
        .lean();
};

export const getKYCForUpdate = async (userId) => {
    return await SellerKYC.findOne({ user: userId });
};

export const getProfileForUpdate = async (userId) => {
    return await BusinessProfile.findOne({ user: userId });
};

export const updateUserSellerStatus = async (userId, isSeller) => {
    return await User.findByIdAndUpdate(userId, { isSeller });
};

export const updateVerificationStatus = async (userId, status, reason, adminId) => {
    const now = new Date();
    const profile = await BusinessProfile.findOne({ user: userId });
    if (!profile) throw new Error("Business profile not found");

    profile.verification = profile.verification || {};
    profile.verification.status = status;
    profile.verification.updatedAt = now;
    profile.verification.verifiedBy = adminId;
    
    if (status === 'rejected') {
        profile.verification.rejectedReason = reason;
    } else {
        profile.verification.rejectedReason = undefined;
    }

    await profile.save();
    
    // Also update User.isSeller if verified
    if (status === 'verified') {
        await User.findByIdAndUpdate(userId, { isSeller: true });
    } else if (status === 'rejected') {
        await User.findByIdAndUpdate(userId, { isSeller: false });
    }

    return profile;
};
