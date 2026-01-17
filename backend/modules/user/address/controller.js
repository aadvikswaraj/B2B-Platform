import * as addressService from "./service.js";
import { validateAddress } from "./validator.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

export const create = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { isDefault, ...rest } = req.body;

        // Validation optional but good practice
        // const { error } = validateAddress(req.body);
        console.log("Adding address:", req.body);
        const address = await addressService.createAddress({ ...rest, user: userId, isDefault: !!isDefault });

        if (isDefault) {
            await addressService.unsetDefaultAddresses(userId, address._id);
        }

        res.locals.response.message = "Address added successfully";
        res.locals.response.data.address = address;
    } catch (e) {
        console.log("Error adding address:", e);
        res.locals.response.success = false;
        res.locals.response.message = "Failed to add address";
        res.locals.response.status = 400;
    }
    sendResponse(res);
};

export const update = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { isDefault, ...updates } = req.body;

        const address = await addressService.updateAddress(
            req.params.id,
            userId,
            { ...updates, ...(isDefault !== undefined ? { isDefault: !!isDefault } : {}) }
        );

        if (!address) {
            res.locals.response.success = false;
            res.locals.response.message = "Address not found";
            res.locals.response.status = 404;
        }

        if (address && isDefault) {
            await addressService.unsetDefaultAddresses(userId, address._id);
        }

        res.locals.response.message = "Address updated successfully";
        res.locals.response.data.address = address;
    } catch {
        res.locals.response.success = false;
        res.locals.response.message = "Failed to update address";
        res.locals.response.status = 400;
    }
    sendResponse(res);
};

export const setDefault = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const id = req.params.id;
        const address = await addressService.getAddressById(id, userId);

        if (!address) {
            res.locals.response.success = false;
            res.locals.response.message = "Address not found";
            res.locals.response.status = 404;
        } else {
            const updated = await addressService.setAddressAsDefault(id, userId);
            res.locals.response.message = "Default address set";
            res.locals.response.data.address = updated;
        }
    } catch (e) {
        res.locals.response.success = false;
        res.locals.response.message = "Failed to set default address";
        res.locals.response.status = 400;
    }
    sendResponse(res);
};

export const list = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const addresses = await addressService.getAddresses(userId);
        res.locals.response.data.addresses = addresses;
        res.locals.response.message = "Addresses fetched successfully";
    } catch {
        res.locals.response.success = false;
        res.locals.response.message = "Failed to fetch addresses";
        res.locals.response.status = 400;
    }
    sendResponse(res);
};

export const getById = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const address = await addressService.getAddressById(req.params.id, userId);
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
};

export const remove = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const result = await addressService.deleteAddress(req.params.id, userId);
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
};
