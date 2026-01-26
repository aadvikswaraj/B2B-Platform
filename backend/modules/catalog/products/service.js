import { Product } from "../../../models/model.js";
import { generateReadUrl } from "../../user/file/service.js";

// list function removed

export const getById = async (id) => {
  let doc = await Product.findById(id)
    .populate("category", "name slug")
    .populate("brand", "name")
    .populate("seller", "name") // populating seller details if needed
    .lean();
  return doc;
};
