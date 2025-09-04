import express, { response } from "express";
import { User, Seller, GSTProfile } from "../../models/model.js";
import { requirePermission } from "../../middleware/requireAdmin.js";
const router = express.Router();

router.get('/', requirePermission('user','view'), async (req, res) => {
  let { search, filters, sort, page, pageSize } = req.query;
  try {
    // Defensive parse for JSON-encoded objects coming from frontend
    if (typeof filters === 'string') {
      try { filters = JSON.parse(filters); } catch { /* ignore */ }
    }
    if (typeof sort === 'string') {
      try { sort = JSON.parse(sort); } catch { /* ignore */ }
    }
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
    // Build the query object
    const query = {
      ...(search && {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
      }),
      ...(filters?.status && { userSuspended: filters.status === 'suspended' }),
      ...(filters?.role === 'admin' && { isAdmin: true }),
      ...(filters?.role === 'seller' && { isSeller: true }),
      ...(filters?.role === 'buyer' && { isAdmin: false, isSeller: false }),
    };

    // Build sort object
    const sortObj = (sort && sort.field)
      ? { [sort.field]: sort.order === 'desc' ? -1 : 1 }
      : { createdAt: -1 };

    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -__v -updatedAt -sellerProfile') // keep createdAt for UI
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize).lean();

    const totalCount = await User.countDocuments(query);

    res.locals.response.data.users = users;
    res.locals.response.data.totalCount = totalCount;

  } catch {
    res.locals.response.success = false;
    res.locals.response.error = 'Internal server error';
  };
  res.json(res.locals.response);
});

// GET /admin/users/:id - fetch single user detail
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user){
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/users/:id/with-profiles - expanded data (seller + gst)
router.get('/:id/with-profiles', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if(!user){
      return res.status(404).json({ error: 'User not found' });
    }
    let seller = null;
    let gstProfile = null;
    if(user.isSeller && user.sellerProfile){
      seller = await Seller.findById(user.sellerProfile).lean();
      if(seller?.gstProfile){
        gstProfile = await GSTProfile.findById(seller.gstProfile).lean();
      }
    }
    res.json({ user, seller, gstProfile });
  } catch (error) {
    console.error('Error fetching expanded user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/users-count - count users
router.get('/users-count', async (req, res) => {
  const { id } = req.params;
  try {
    const count = await User.countDocuments({ _id: id });
    res.locals.response.data = { count };
  } catch {
    res.locals.response.success = false;
    res.locals.response.error = 'Internal server error';
  }
  res.json(res.locals.response);
});

// POST /admin/users/:id/edit - update user information
router.post('/:id/edit', requirePermission('user','edit'), async (req, res) => {
  const { name, email, isAdmin, isSeller, userSuspended } = req.body;
  const user = await User.findByIdAndUpdate({
    _id: req.params.id
  }, { name, email, isAdmin, isSeller, userSuspended });
  
  if (!user) {
    res.locals.response.success = false;
    res.locals.response.message = "User not found";
  }
  else {
    res.locals.response.message = "User updated successfully";
  }
  res.json(res.locals.response);
});

// DELETE /admin/users/:id - delete a user
router.delete('/:id', requirePermission('user','delete'), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    res.locals.response.success = false;
    res.locals.response.message = "User not found";
  }
  else {
    res.locals.response.message = "User deleted successfully";
  }
  res.json(res.locals.response);
});

// POST /admin/users/new - create a new user
router.post('/new', requirePermission('user','create'), async (req, res) => {
  const { name, email, password, isAdmin, isSeller } = req.body;
  try {
    const user = await User.create({ name, email, password, isAdmin, isSeller });
    res.locals.response.message = "User created successfully";
  }
  catch {
    res.locals.response.success = false;
    res.locals.response.message = "Something went wrong";
  }
  res.json(res.locals.response);
});

export default router;