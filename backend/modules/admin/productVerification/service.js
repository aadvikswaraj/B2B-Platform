import { Product } from "../../../models/model.js";

/**
 * List products with search and filters
 */
export const list = async (query, search, statusFilter, skip, limit, sort = { createdAt: -1 }) => {
    const products = await Product.find(query)
        .populate([
            { path: "seller", model: "User", select: "name email" },
            { path: "brand", model: "Brand", select: "name" },
            { path: "category", model: "Category", select: "name" },
        ])
        .sort(sort)
        .lean();

    // Process products and compute moderation status
    let docs = products.map(p => {
        let moderationStatus = "pending";
        if (p.moderation?.status) moderationStatus = p.moderation.status;
        else if (p.status === "rejected") moderationStatus = "rejected";
        else if (p.isApproved) moderationStatus = "approved";

        return {
            _id: p._id,
            title: p.title,
            status: p.status,
            isApproved: p.isApproved,
            moderationStatus,
            price: p.price,
            currency: p.currency,
            imagesCount: Array.isArray(p.images) ? p.images.length : 0,
            seller: p.seller ? { _id: p.seller._id, name: p.seller.name, email: p.seller.email } : null,
            brand: p.brand ? { _id: p.brand._id, name: p.brand.name } : null,
            category: p.category ? { _id: p.category._id, name: p.category.name } : null,
            createdAt: p.createdAt,
        };
    });

    // Search filter
    if (search) {
        const s = String(search).toLowerCase();
        docs = docs.filter(d =>
            (d.title || "").toLowerCase().includes(s) ||
            (d.seller?.name || "").toLowerCase().includes(s) ||
            (d.seller?.email || "").toLowerCase().includes(s)
        );
    }

    // Status filter
    if (statusFilter) {
        docs = docs.filter(d => d.moderationStatus === statusFilter);
    }

    const totalCount = docs.length;
    const paged = docs.slice(skip, skip + limit);

    return { docs: paged, totalCount };
};

export const getById = async (id) => {
    const product = await Product.findById(id)
        .populate([
            { path: "seller", model: "User", select: "name email phone" },
            { path: "brand", model: "Brand", select: "name kyc" },
            { path: "category", model: "Category", select: "name" },
        ])
        .lean();

    if (!product) return null;

    // Compute moderation status
    let moderationStatus = "pending";
    if (product.moderation?.status) moderationStatus = product.moderation.status;
    else if (product.status === "rejected") moderationStatus = "rejected";
    else if (product.isApproved) moderationStatus = "approved";

    return {
        _id: product._id,
        title: product.title,
        description: product.description,
        specifications: product.specifications || [],
        price: product.price,
        currency: product.currency,
        minOrderQuantity: product.minOrderQuantity,
        status: product.status,
        isApproved: product.isApproved,
        moderation: product.moderation || { status: moderationStatus },
        moderationStatus,
        images: product.images || [],
        seller: product.seller || null,
        brand: product.brand || null,
        category: product.category || null,
        createdAt: product.createdAt,
    };
};

export const getForUpdate = async (id) => {
    return await Product.findById(id);
};
