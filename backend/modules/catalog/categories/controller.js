import { sendResponse } from "../../../middleware/responseTemplate.js";
import * as categoryService from "./service.js";

function buildTree(flat) {
    const byId = new Map();
    flat.forEach((c) => byId.set(String(c._id), { id: String(c._id), name: c.name, children: [] }));
    const roots = [];
    flat.forEach((c) => {
        const id = String(c._id);
        if (c.parentCategory) {
            const parent = byId.get(String(c.parentCategory));
            if (parent) parent.children.push(byId.get(id));
            else roots.push(byId.get(id));
        } else {
            roots.push(byId.get(id));
        }
    });
    return roots;
}

export const list = async (req, res) => {
    try {
        let {
            search = "",
            page = 1,
            pageSize = 20,
            parent = "any",
            depth,
            sort = "depth,name",
        } = req.query;
        page = parseInt(page) || 1;
        pageSize = Math.min(100, parseInt(pageSize) || 20);
        const q = { isActive: true };
        if (search) {
            q.$or = [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (parent !== "any") {
            if (parent === "root") q.parentCategory = null;
            else q.parentCategory = parent;
        }
        if (depth !== undefined) {
            const d = parseInt(depth);
            if (!isNaN(d)) q.depth = d;
        }
        const skip = (page - 1) * pageSize;
        const sortObj = {};
        sort.split(",").forEach((tok) => {
            tok = tok.trim();
            if (!tok) return;
            if (tok.startsWith("-")) sortObj[tok.slice(1)] = -1;
            else sortObj[tok] = 1;
        });

        const { items, total } = await categoryService.listCategories(q, sortObj, skip, pageSize);

        res.locals.response.data = {
            categories: items,
            totalCount: total,
            page,
            pageSize,
        };
    } catch (err) {
        res.locals.response.success = false;
        res.locals.response.message = "Failed to fetch categories";
        res.locals.response.status = 500;
    }
    return sendResponse(res);
};

export const tree = async (req, res) => {
    try {
        let { maxDepth = 2, limit = 1000, search = "" } = req.query;
        maxDepth = parseInt(maxDepth) || 2;
        limit = Math.min(2000, parseInt(limit) || 1000);
        const q = { depth: { $lte: maxDepth }, isActive: true };
        if (search) {
            q.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }
        const docs = await categoryService.listCategoriesForTree(q, limit);
        const tree = buildTree(docs);
        res.locals.response.data = { tree, count: docs.length };
    } catch (err) {
        res.locals.response.success = false;
        res.locals.response.message = "Failed to fetch category tree";
        res.locals.response.status = 500;
    }
    return sendResponse(res);
};

export const getById = async (req, res) => {
    try {
        const cat = await categoryService.getCategoryById(req.params.id);
        if (!cat) {
            res.locals.response.success = false;
            res.locals.response.message = 'Not found';
            res.locals.response.status = 404;
        } else {
            res.locals.response.data = cat;
        }
    } catch (err) {
        res.locals.response.success = false;
        res.locals.response.message = 'Failed to fetch category';
        res.locals.response.status = 500;
    }
    return sendResponse(res);
};

export const getCommission = async (req, res) => {
    try {
        const { amount } = req.query;
        const doc = await categoryService.getCategoryByIdForCommission(req.params.id);
        if (!doc) {
            res.locals.response.success = false;
            res.locals.response.message = 'Not found';
            res.locals.response.status = 404;
        } else {
            let percent = null;
            if (amount !== undefined) {
                percent = await doc.getCommissionPercentForAmount(Number(amount));
            } else {
                const eff = await doc.resolveEffectiveCommission();
                if (eff?.mode === 'exact') percent = eff.exact ?? null;
            }
            res.locals.response.data = { percent };
        }
    } catch (err) {
        res.locals.response.success = false;
        res.locals.response.message = "Failed to resolve commission";
        res.locals.response.status = 500;
    }
    return sendResponse(res);
};
