import { Brand } from "../../../models/model.js";

export const listBrands = async (query, limit) => {
    return await Brand.find(query).select('name').sort({ name: 1 }).limit(limit).lean();
};
