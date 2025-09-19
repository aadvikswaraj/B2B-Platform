import express, { response } from "express";
import { User } from "../../models/model.js";
import { requirePermission } from "../../middleware/requireAdmin.js";
const router = express.Router();

router.get('/', requirePermission('user','view'), async (req, res) => {
  let { search, filters, sort, page, pageSize } = req.query;
  try {
    if (typeof filters === 'string') { try { filters = JSON.parse(filters); } catch { } }
    if (typeof sort === 'string') { try { sort = JSON.parse(sort); } catch { } }
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    const query = {
      ...(search && { $or: [ { name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } } ] }),
      ...(filters?.status && { userSuspended: filters.status === 'suspended' }),
      ...(filters?.role === 'admin' && { isAdmin: true }),
      ...(filters?.role === 'seller' && { isSeller: true }),
      ...(filters?.role === 'buyer' && { isAdmin: false, isSeller: false }),
    };
    const sortObj = (sort && sort.field) ? { [sort.field]: sort.order === 'desc' ? -1 : 1 } : { createdAt: -1 };
    const skip = (page - 1) * pageSize;
    const users = await User.find(query)
      .select('-password -__v -updatedAt -sellerProfile')
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize).lean();
    const totalCount = await User.countDocuments(query);
  res.locals.response.data = { users, totalCount, page, pageSize };
  return res.json(res.locals.response);
  } catch (e) {
  res.locals.response.success = false;
  res.locals.response.message = 'Internal server error';
  return res.status(500).json(res.locals.response);
  }
});

// GET /admin/users/:id - fetch single user detail
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if(!user){
      res.locals.response.success = false;
      res.locals.response.message = 'User not found';
      return res.status(404).json(res.locals.response);
    }
    res.locals.response.data = user;
    return res.json(res.locals.response);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.locals.response.success = false;
    res.locals.response.message = 'Internal server error';
    return res.status(500).json(res.locals.response);
  }
});

// GET /admin/users/:id/with-profiles - expanded data (seller + gst)
router.get('/:id/with-profiles', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if(!user){
      res.locals.response.success = false;
      res.locals.response.message = 'User not found';
      return res.status(404).json(res.locals.response);
    }
    let seller = null; let gstProfile = null;
    if(user.isSeller && user.sellerProfile){
      seller = await Seller.findById(user.sellerProfile).lean();
      if(seller?.gstProfile){
        gstProfile = await GSTProfile.findById(seller.gstProfile).lean();
      }
    }
  res.locals.response.data = { user, seller, gstProfile };
  return res.json(res.locals.response);
  } catch (error) {
    console.error('Error fetching expanded user:', error);
  res.locals.response.success = false;
  res.locals.response.message = 'Internal server error';
  return res.status(500).json(res.locals.response);
  }
});

// GET /admin/users-count - count users
router.get('/users-count', async (req, res) => {
  const { id } = req.params;
  try {
    const count = await User.countDocuments({ _id: id });
  res.locals.response.data = { count };
  return res.json(res.locals.response);
  } catch (e) {
  res.locals.response.success = false;
  res.locals.response.message = 'Internal server error';
  return res.status(500).json(res.locals.response);
  }
});

// POST /admin/users/:id/edit - update user information
router.post('/:id/edit', requirePermission('user','edit'), async (req, res) => {
  try {
    const { name, email, isAdmin, isSeller, userSuspended } = req.body;
    const user = await User.findByIdAndUpdate({ _id: req.params.id }, { name, email, isAdmin, isSeller, userSuspended });
    if (!user){
      res.locals.response.success = false;
      res.locals.response.message = 'User not found';
      return res.status(404).json(res.locals.response);
    }
    res.locals.response.message = 'User updated successfully';
    return res.json(res.locals.response);
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = 'Internal server error';
    return res.status(500).json(res.locals.response);
  }
});

// DELETE /admin/users/:id - delete a user
router.delete('/:id', requirePermission('user','delete'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user){
      res.locals.response.success = false;
      res.locals.response.message = 'User not found';
      return res.status(404).json(res.locals.response);
    }
    res.locals.response.message = 'User deleted successfully';
    return res.json(res.locals.response);
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = 'Internal server error';
    return res.status(500).json(res.locals.response);
  }
});

// POST /admin/users/new - create a new admin user
router.post('/new-admin', requirePermission('user','create'), async (req, res) => {
  const { name, email, password } = req.body;
  try {
  await User.create({ name, email, password, isAdmin: true });
  res.locals.response.message = 'User created successfully';
  return res.json(res.locals.response);
  }
  catch (e) {
  res.locals.response.success = false;
  res.locals.response.message = 'Something went wrong';
  return res.status(400).json(res.locals.response);
  }
});

export default router;