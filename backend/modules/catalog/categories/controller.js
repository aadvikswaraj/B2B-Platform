import { sendResponse } from "../../../middleware/responseTemplate.js";
import * as categoryService from "./service.js";

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

    const { items, total } = await categoryService.listCategories(
      q,
      sortObj,
      skip,
      pageSize,
    );

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

export const getById = async (req, res) => {
  try {
    const cat = await categoryService.getCategoryById(req.params.id);
    if (!cat) {
      res.locals.response.success = false;
      res.locals.response.message = "Not found";
      res.locals.response.status = 404;
    } else {
      res.locals.response.data = cat;
    }
  } catch (err) {
    res.locals.response.success = false;
    res.locals.response.message = "Failed to fetch category";
    res.locals.response.status = 500;
  }
  return sendResponse(res);
};
