import * as userService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";


export const list = createListController({
    service: userService.list,
    searchFields: ["name", "email", "phone"],
    filterMap: {
        status: (v) => ({ userSuspended: v === "suspended" }),
        role: (v) => {
            if (v === "admin") return { isAdmin: true };
            if (v === "seller") return { isSeller: true };
            if (v === "buyer") return { isAdmin: false, isSeller: false };
            return {};
        },
    },
});

/**
 * Get user by ID with populated role
 */
export const getById = async (req, res) => {
    try {
        const user = await userService.getById(req.params.id);

        if (!user) {
            res.locals.response = {
                success: false,
                message: "User not found",
                status: 404
            };
        }
        else {
            res.locals.response = {
                success: true,
                message: "User fetched successfully",
                status: 200,
                data: user
            };
        }
    } catch (error) {
        console.error("Error in getById:", error);
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
        };
    }
    return sendResponse(res);
};


/**
 * Update user details

 */
export const update = async (req, res) => {
    try {
        const user = await userService.update(req.params.id, req.body);

        if (!user) {
            res.locals.response = {
                success: false,
                message: "User not found",
                status: 404
            };
        }
        else {
            res.locals.response = {
                success: true,
                message: "User updated successfully",
                status: 200,
                data: user
            };
        }
    } catch (error) {
        console.error("Error in update:", error);
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
        };
    }
    return sendResponse(res);
};

/**
 * Delete user permanently
 */
export const remove = async (req, res) => {
    try {
        const user = await userService.remove(req.params.id);

        if (!user) {
            res.locals.response = {
                success: false,
                message: "User not found",
                status: 404
            };
        }
        else {
            res.locals.response = {
                success: true,
                message: "User deleted successfully",
                status: 200
            };
        }
    } catch (error) {
        console.error("Error in remove:", error);
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
        };
    }
    return sendResponse(res);
};

/**
 * Create new admin user with role

 */
export const createAdmin = async (req, res) => {
    try {
        // Check if email exists
        const existingUser = await userService.findByEmail(req.body.email);
        if (existingUser) {
            res.locals.response = {
                success: false,
                message: "Email already exists",
                status: 400
            };
        }
        else {
            const admin = await userService.createAdmin(req.body);
            res.locals.response = {
                success: true,
                message: "Admin user created successfully",
                status: 201,
                data: admin
            };
        }
    } catch (error) {
        console.error("Error in createAdmin:", error);
        res.locals.response = {
            success: false,
            message: error.code === 11000 ? "Email already exists" : error.message,
            status: error.code === 11000 ? 400 : 500
        };
    }
    return sendResponse(res);
};
