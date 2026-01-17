import { AdminRole, User } from "../../../models/model.js";

/**
 * List roles with query, pagination, and sorting
 */
export const list = async (match, skip, limit, sort = { createdAt: -1 }) => {
    const [docs, totalCount] = await Promise.all([
        AdminRole.find(match)
            .select("-__v")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        AdminRole.countDocuments(match),
    ]);
    return { docs, totalCount };
};

export const getUsersByRole = async (roleId, skip, limit) => {
    const [users, total] = await Promise.all([
        User.find({ adminRole: roleId })
            .select("name email createdAt")
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments({ adminRole: roleId }),
    ]);
    return { users, total };
};

export const getById = async (id) => {
    return await AdminRole.findById(id).select("-__v").lean();
};

export const create = async (data) => {
    const role = new AdminRole(data);
    return await role.save();
};

export const update = async (id, data) => {
    return await AdminRole.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
};

export const remove = async (id) => {
    return await AdminRole.findByIdAndDelete(id);
};

export const countUsersByRole = async (roleId) => {
    return await User.countDocuments({ adminRole: roleId });
};

export const reassignUsersFromRole = async (sourceRoleId, targetRoleId) => {
    return await User.updateMany(
        { adminRole: sourceRoleId },
        { $set: { adminRole: targetRoleId } }
    );
};

export const deleteUsersByRole = async (roleId) => {
    return await User.deleteMany({ adminRole: roleId });
};
