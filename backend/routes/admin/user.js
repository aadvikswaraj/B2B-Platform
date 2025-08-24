import express, { response } from "express";
import { User, Seller, GSTProfile } from "../../models/model.js";
import { requirePermission } from "../../middleware/requireAdmin.js";
const router = express.Router();

router.get('/', requirePermission('user','view'), async (req, res) => {
  const { search, filters, sort, page, pageSize } = req.query;
  try {
    // Build the query object
    const query = {
      ...(search && {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
      }),
      ...(filters?.status && { userSuspended: filters.status === 'suspended' }),
      ...(filters?.role && { isAdmin: filters.role === 'admin', isSeller: filters.role === 'seller' }),
    };

    // Build sort object
    const sortObj = sort ? { [sort.field]: sort.order === 'desc' ? -1 : 1 } : { createdAt: -1 };

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -__v -createdAt -updatedAt -sellerProfile') // Exclude fields
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(pageSize)).lean();

    res.locals.response.data = users;
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

export default router;