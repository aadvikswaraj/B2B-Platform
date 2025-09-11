import express from "express";
import { Category } from "../../models/model.js";
const router = express.Router();

// Utility to build a tree from flat categories (assumes all provided belong within requested depth range)
function buildTree(flat){
  const byId = new Map();
  flat.forEach(c => byId.set(String(c._id), { ...c, children: [] }));
  const roots = [];
  flat.forEach(c => {
    if(c.parentCategory){
      const parent = byId.get(String(c.parentCategory));
      if(parent) parent.children.push(byId.get(String(c._id)));
      else roots.push(byId.get(String(c._id))); // orphan fallback
    } else {
      roots.push(byId.get(String(c._id)));
    }
  });
  return roots;
}

// List categories with pagination, search, optional parent filter
router.get('/', async (req, res) => {
  try {
    let { search = '', page = 1, pageSize = 20, parent = 'any', depth, sort='depth,name' } = req.query;
    page = parseInt(page) || 1;
    pageSize = Math.min(100, parseInt(pageSize) || 20);
    const q = {};
    if(search){
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if(parent !== 'any'){
      if(parent === 'root') q.parentCategory = null; else q.parentCategory = parent;
    }
    if(depth !== undefined){
      const d = parseInt(depth);
      if(!isNaN(d)) q.depth = d;
    }
    const skip = (page - 1) * pageSize;
    const sortObj = {};
    sort.split(',').forEach(tok => {
      tok = tok.trim();
      if(!tok) return;
      if(tok.startsWith('-')) sortObj[tok.slice(1)] = -1; else sortObj[tok] = 1;
    });
    const [items, total] = await Promise.all([
      Category.find(q)
        .select('-__v')
        .sort(sortObj)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Category.countDocuments(q)
    ]);
  res.locals.response.data = { categories: items, totalCount: total, page, pageSize };
  return res.json(res.locals.response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.fail('Internal server error', 500, error.message);
  }
});

// Tree endpoint (limited depth & count) for sidebar / selectors
router.get('/tree', async (req, res) => {
  try {
    let { maxDepth = 2, parent = 'root', search = '', limit = 500 } = req.query;
    maxDepth = parseInt(maxDepth);
    limit = Math.min(1000, parseInt(limit)||500);
    const q = {};
    if(parent === 'root'){
      q.depth = { $lte: maxDepth };
    } else {
      q.depth = { $lte: maxDepth };
    }
    if(search){
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }
    const all = await Category.find(q).select('name slug parentCategory depth').sort({ depth:1, name:1 }).limit(limit).lean();
    let subset = all;
    if(parent !== 'root'){
      const parentId = String(parent);
      subset = all.filter(c => String(c._id) === parentId || (c.ancestors && c.ancestors.map(a=>String(a)).includes(parentId)));
    }
    const tree = buildTree(subset);
  res.locals.response.data = { tree, count: subset.length };
  return res.json(res.locals.response);
  } catch (e) {
    return res.fail('Failed to build tree', 500, e.message);
  }
});

// Suggestions for autocomplete (parent picker)
router.get('/suggest', async (req, res) => {
  try {
    const { q = '', depth, limit = 10, exclude } = req.query;
    const query = {};
    if(q){
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } }
      ];
    }
    if(depth !== undefined){
      const d = parseInt(depth);
      if(!isNaN(d)) query.depth = d;
    }
    if(exclude){
      const ids = exclude.split(',').filter(Boolean);
      query._id = { $nin: ids };
    }
    const items = await Category.find(query).select('name slug depth parentCategory').limit(parseInt(limit)||10).lean();
  res.locals.response.data = { categories: items };
  return res.json(res.locals.response);
  } catch (e) {
    return res.fail('Suggest failed', 500, e.message);
  }
});

// Get path (ancestors + self) for breadcrumb or effective commission preview
router.get('/:id/path', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id).populate('ancestors').lean();
    if(!cat){
      res.locals.response.success = false;
      res.locals.response.message = 'Not found';
      return res.status(404).json(res.locals.response);
    }
    const path = [...(cat.ancestors||[]), cat];
    res.locals.response.data = { path };
    return res.json(res.locals.response);
  } catch (e) {
    return res.fail('Path fetch failed', 500, e.message);
  }
});

// Resolve effective commission for a hypothetical category (without saving) given parent + commission object
router.post('/resolve-commission', async (req, res) => {
  try {
    const { parentCategory, commission } = req.body;
  if(!commission){ res.locals.response.data={ effective:null }; return res.json(res.locals.response); }
  if(commission.mode !== 'inherit'){ res.locals.response.data={ effective:commission }; return res.json(res.locals.response); }
  if(!parentCategory){ res.locals.response.data={ effective:commission }; return res.json(res.locals.response); }
    const parent = await Category.findById(parentCategory).lean();
  if(!parent){ res.locals.response.data={ effective:commission }; return res.json(res.locals.response); }
    let eff = parent.commission;
    if(eff?.mode === 'inherit'){
      const ancestors = await Category.find({ _id: { $in: parent.ancestors || [] } }).select('commission').lean();
      const order = (parent.ancestors||[]).map(id=>String(id));
      ancestors.sort((a,b)=>order.indexOf(String(a._id))-order.indexOf(String(b._id)));
      for(let i=ancestors.length-1;i>=0;i--){
        if(ancestors[i].commission?.mode !== 'inherit'){ eff = ancestors[i].commission; break; }
      }
    }
  res.locals.response.data = { effective: eff || commission };
  return res.json(res.locals.response);
  } catch (e) {
    return res.fail('Resolve failed', 500, e.message);
  }
});

// Bulk activate/deactivate
router.post('/bulk/status', async (req, res) => {
  try {
    const { ids = [], isActive } = req.body;
    if(!Array.isArray(ids) || typeof isActive !== 'boolean') {
      res.locals.response.success = false;
      res.locals.response.message = 'Invalid payload';
      return res.status(400).json(res.locals.response);
    }
    const result = await Category.updateMany({ _id: { $in: ids } }, { $set: { isActive } });
    res.locals.response.message = 'Status updated';
    res.locals.response.data = { matched: result.matchedCount || result.n, modified: result.modifiedCount || result.nModified };
    return res.json(res.locals.response);
  } catch (e) {
    return res.fail('Bulk status failed', 500, e.message);
  }
});

// Create category
router.post('/new', async (req, res) => {
  try {
    const { name, slug, description, parentCategory, specifications = [], commission } = req.body;
    const cat = await Category.create({ name, slug, description, parentCategory: parentCategory || null, specifications, commission });
  res.locals.response.data = cat;
  res.locals.response.message = 'Category created';
  return res.json(res.locals.response);
  } catch (error) {
    return res.fail(error.message || 'Failed to create category', 400);
  }
});

// Get single category (with ancestors for commission preview)
router.get('/:id', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id).populate('ancestors').lean();
    if(!cat){
      res.locals.response.success = false;
      res.locals.response.message = 'Not found';
      return res.status(404).json(res.locals.response);
    }
    res.locals.response.data = cat;
    return res.json(res.locals.response);
  } catch (e) {
    return res.fail('Internal server error', 500, e.message);
  }
});

// Update category
router.post('/:id/edit', async (req, res) => {
  try {
    const { name, slug, description, parentCategory, specifications, commission } = req.body;
    const cat = await Category.findByIdAndUpdate(req.params.id, { name, slug, description, parentCategory: parentCategory || null, specifications, commission }, { new:true });
    if(!cat){
      res.locals.response.success = false;
      res.locals.response.message = 'Not found';
      return res.status(404).json(res.locals.response);
    }
    res.locals.response.data = cat;
    res.locals.response.message = 'Category updated';
    return res.json(res.locals.response);
  } catch (e) {
    return res.fail(e.message || 'Update failed', 400);
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
  await Category.findByIdAndDelete(req.params.id);
  res.locals.response.message = 'Category deleted';
  return res.json(res.locals.response);
  } catch (e) {
    return res.fail(e.message || 'Delete failed', 400);
  }
});

export default router;