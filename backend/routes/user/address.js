import express from "express";
import { Address } from "../../models/model.js";
import requireLogin from "../../middleware/requireLogin.js";
import { sendResponse } from "../../middleware/responseTemplate.js";

const router = express.Router();

// Add new address
router.post("/", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { isDefault, ...rest } = req.body;
    const address = await Address.create({ ...rest, user: userId, isDefault: !!isDefault });
    // If this is set as default, unset default for all other addresses
    if (isDefault) {
      await Address.updateMany({ user: userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
    }
    res.locals.response.message = "Address added successfully";
    res.locals.response.data.address = address;
  } catch (e){
    console.log("Error adding address:", e);
    res.locals.response.success = false;
    res.locals.response.message = "Failed to add address";
    res.locals.response.status = 400;
  }
  sendResponse(res);
});

// Edit address
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { isDefault, ...updates } = req.body;
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: { ...updates, ...(isDefault !== undefined ? { isDefault: !!isDefault } : {}) } },
      { new: true }
    );
    if (!address) {
      res.locals.response.success = false;
      res.locals.response.message = "Address not found";
      res.locals.response.status = 404;
    }
    // If set to default now, unset others
    if (address && isDefault) {
      await Address.updateMany({ user: userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
    }
    res.locals.response.message = "Address updated successfully";
    res.locals.response.data.address = address;
  } catch {
    res.locals.response.success = false;
    res.locals.response.message = "Failed to update address";
    res.locals.response.status = 400;
  }
  sendResponse(res);
});

// Set default address endpoint
router.post("/:id/default", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const id = req.params.id;
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      res.locals.response.success = false;
      res.locals.response.message = "Address not found";
      res.locals.response.status = 404;
    } else {
      await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
      await Address.updateOne({ _id: id, user: userId }, { $set: { isDefault: true } });
      res.locals.response.message = "Default address set";
      res.locals.response.data.address = await Address.findById(id);
    }
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Failed to set default address";
    res.locals.response.status = 400;
  }
  sendResponse(res);
});

// Get all addresses for logged-in user
router.get("/", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addresses = await Address.find({ user: userId });
    res.locals.response.data.addresses = addresses;
    res.locals.response.message = "Addresses fetched successfully";
  } catch {
    res.locals.response.success = false;
    res.locals.response.message = "Failed to fetch addresses";
    res.locals.response.status = 400;
  }
  sendResponse(res);
});

// Get single address by ID
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const address = await Address.findOne({ _id: req.params.id, user: userId });
    if (!address) {
      res.locals.response.success = false;
      res.locals.response.message = "Address not found";
      res.locals.response.status = 404;
    } else {
      res.locals.response.data.address = address;
      res.locals.response.message = "Address fetched successfully";
    }
  } catch {
    res.locals.response.success = false;
    res.locals.response.message = "Failed to fetch address";
    res.locals.response.status = 400;
  }
  sendResponse(res);
});

// Delete address
router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const result = await Address.deleteOne({
      _id: req.params.id,
      user: userId,
    });
    if (result.deletedCount === 0) {
      res.locals.response.success = false;
      res.locals.response.message = "Address not found";
      res.locals.response.status = 404;
    } else {
      res.locals.response.message = "Address deleted successfully";
    }
  } catch {
    res.locals.response.success = false;
    res.locals.response.message = "Failed to delete address";
    res.locals.response.status = 400;
  }
  sendResponse(res);
});

export default router;
