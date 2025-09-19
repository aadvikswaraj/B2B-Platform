import express from 'express';
import { User, BusinessProfile, Address } from '../../models/model.js';
import requireLogin from '../../middleware/requireLogin.js';
import { sendResponse } from '../../middleware/responseTemplate.js';

const router = express.Router();


// Get current user's profile (personal + business)
router.get('/', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
      .select('-password')
      .populate({
        path: 'businessProfile',
        populate: { path: 'address', model: 'Address' }
      });
    res.locals.response.data.user = user || null;
    res.locals.response.data.business = user?.businessProfile || null;
    res.locals.response.message = 'Profile fetched';
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = 'Failed to fetch profile';
    res.locals.response.status = 400;
  }
  sendResponse(res);
});

// Update user and business profile
router.post('/', requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { name, email, phone, avatarUrl, productCategories, socials,
      companyName, businessType, gstin, pan, address, website, description } = req.body;

    // Update user fields
    await User.findByIdAndUpdate(userId, {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(avatarUrl && { avatarUrl }),
      ...(productCategories && { productCategories }),
      ...(socials && { socials })
    });

    // Upsert business profile
    let businessProfile = await BusinessProfile.findOne({ user: userId });
    if (!businessProfile) {
      businessProfile = new BusinessProfile({ user: userId });
    }
    if (companyName !== undefined) businessProfile.companyName = companyName;
    if (businessType !== undefined) businessProfile.businessType = businessType;
    if (gstin !== undefined) businessProfile.gstin = gstin;
    if (pan !== undefined) businessProfile.pan = pan;
    if (address !== undefined) businessProfile.address = address;
    if (website !== undefined) businessProfile.website = website;
    if (description !== undefined) businessProfile.description = description;
    await businessProfile.save();

    // Ensure user.businessProfile is set
    await User.findByIdAndUpdate(userId, { businessProfile: businessProfile._id });

    // Return updated profile
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'businessProfile',
        populate: { path: 'address', model: 'Address' }
      });
    res.locals.response.data.user = user;
    res.locals.response.data.business = user.businessProfile;
    res.locals.response.message = 'Profile saved';
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = 'Failed to save profile';
    res.locals.response.status = 400;
  }
  sendResponse(res);
});

export default router;
