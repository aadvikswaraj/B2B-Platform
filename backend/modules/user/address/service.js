import { Address } from "../../../models/model.js";

export const createAddress = async (data) => {
    return await Address.create(data);
};

export const updateAddress = async (id, userId, updates) => {
    return await Address.findOneAndUpdate(
        { _id: id, user: userId },
        { $set: updates },
        { new: true }
    );
};

export const unsetDefaultAddresses = async (userId, excludeId) => {
    const query = { user: userId };
    if (excludeId) query._id = { $ne: excludeId };
    await Address.updateMany(query, { $set: { isDefault: false } });
};

export const setAddressAsDefault = async (id, userId) => {
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    await Address.updateOne({ _id: id, user: userId }, { $set: { isDefault: true } });
    return await Address.findById(id);
};

export const getAddresses = async (userId) => {
    return await Address.find({ user: userId });
};

export const getAddressById = async (id, userId) => {
    return await Address.findOne({ _id: id, user: userId });
};

export const deleteAddress = async (id, userId) => {
    return await Address.deleteOne({ _id: id, user: userId });
};
