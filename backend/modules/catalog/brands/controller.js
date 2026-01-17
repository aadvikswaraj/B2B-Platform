import * as brandService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

export const list = async (req, res) => {
    try {
        const { search, limit = 100 } = req.query || {};
        const q = { 'kyc.status': 'verified' };
        if (search) {
            q.name = { $regex: String(search).trim(), $options: 'i' };
        }
        const docs = await brandService.listBrands(q, Math.min(500, parseInt(limit) || 100));
        res.locals.response.data = { brands: docs, count: docs.length };
    } catch (err) {
        res.locals.response.success = false;
        res.locals.response.message = "Failed to fetch brands";
        res.locals.response.status = 500;
    }
    return sendResponse(res);
};
