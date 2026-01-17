import * as roleService from "./service.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

/**
 * List all roles with pagination, search, and filters
 */
export const list = createListController({
    service: roleService.list,
    searchFields: ["roleName"],
    filterMap: {
        isActive: (v) => ({ isActive: v }),
        isSuperAdmin: (v) => ({ isSuperAdmin: v }),
    },
});



/**
 * Get users by role ID with pagination
 */
export const getUsers = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        
        const { users, total } = await roleService.getUsersByRole(
            req.params.id, 
            skip, 
            parseInt(pageSize)
        );

        res.locals.response = {
            success: true,
            message: "Users fetched successfully",
            status: 200,
            data: {
                docs: users,
                totalCount: total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(total / parseInt(pageSize)),
            }
        };
    } catch (error) {
        console.error("Error in getUsers:", error);
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
        };
    }
    return sendResponse(res);
};

/**
 * Get count of users assigned to a role
 */
export const getUsersCount = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await roleService.countUsersByRole(id);
        
        res.locals.response = {
            success: true,
            message: "Users count fetched successfully",
            status: 200,
            data: { count }
        };
    } catch (error) {
        console.error("Error in getUsersCount:", error);
        res.locals.response = {
            success: false,
            message: error.message,
            status: 500
        };
    }
    return sendResponse(res);
};

/**
 * Create new role
 */
export const create = async (req, res) => {
    try {
        const role = await roleService.create(req.body);
        
        res.locals.response = {
            success: true,
            message: "Role created successfully",
            status: 201,
            data: role
        };
    } catch (error) {
        console.error("Error in create:", error);
        res.locals.response = {
            success: false,
            message: error.code === 11000 
                ? "Role name already exists" 
                : error.message,
            status: error.code === 11000 ? 400 : 500
        };
    }
    return sendResponse(res);
};

/**
 * Get role by ID
 */
export const getById = async (req, res) => {
    try {
        const role = await roleService.getById(req.params.id);
        
        if (!role) {
            res.locals.response = {
                success: false,
                message: "Role not found",
                status: 404
            };
        }
        else {
            res.locals.response = {
                success: true,
                message: "Role fetched successfully",
                status: 200,
                data: role
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
 * Delete role with optional user handling strategy
 */
export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const { strategy = "none", targetRoleId } = req.body || {};
        
        // Check if role exists
        const role = await roleService.getById(id);
        if (!role) {
            res.locals.response = {
                success: false,
                message: "Role not found",
                status: 404
            };
            return sendResponse(res);
        }
        
        // Get users assigned to this role
        const usersCount = await roleService.countUsersByRole(id);
        
        // Handle users based on strategy
        if (usersCount > 0) {
            if (strategy === "reassign") {
                // Validate targetRoleId
                if (!targetRoleId) {
                    res.locals.response = {
                        success: false,
                        message: "targetRoleId is required for reassignment strategy",
                        status: 400
                    };
                    return sendResponse(res);
                }
                
                if (String(targetRoleId) === String(id)) {
                    res.locals.response = {
                        success: false,
                        message: "targetRoleId cannot be the same as the role being deleted",
                        status: 400
                    };
                    return sendResponse(res);
                }
                
                // Check if target role exists
                const targetRole = await roleService.getById(targetRoleId);
                if (!targetRole) {
                    res.locals.response = {
                        success: false,
                        message: "Target role not found",
                        status: 404
                    };
                    return sendResponse(res);
                }
                
                // Reassign users to target role
                await roleService.reassignUsersFromRole(id, targetRoleId);
            } else if (strategy === "delete-users") {
                // Delete all users assigned to this role
                await roleService.deleteUsersByRole(id);
            } else if (strategy === "none") {
                // Don't allow deletion if users exist without strategy
                res.locals.response = {
                    success: false,
                    message: `Cannot delete role. ${usersCount} user(s) are assigned to this role. Please specify a strategy.`,
                    status: 400,
                    data: { usersCount }
                };
                return sendResponse(res);
            } else {
                res.locals.response = {
                    success: false,
                    message: "Invalid strategy. Use 'reassign', 'delete-users', or 'none'",
                    status: 400
                };
                return sendResponse(res);
            }
        }
        
        // Delete the role
        await roleService.remove(id);
        
        res.locals.response = {
            success: true,
            message: "Role deleted successfully",
            status: 200,
            data: { affectedUsers: usersCount }
        };
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
 * Update role
 */
export const update = async (req, res) => {
    try {
        const role = await roleService.update(req.params.id, req.body);
        
        if (!role) {
            res.locals.response = {
                success: false,
                message: "Role not found",
                status: 404
            };
        }
        else {
            res.locals.response = {
                success: true,
                message: "Role updated successfully",
                status: 200,
                data: role
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
