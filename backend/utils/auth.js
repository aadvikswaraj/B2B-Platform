
import { AdminRole } from '../models/model.js';

// Set user info in session after successful login
export const makeLoggedIn = async (req, user) => {
  let permissions = {};
  
  // If user has an admin role, fetch current permissions from the role
  if (user.adminRole) {
    try {
      const role = await AdminRole.findById(user.adminRole);
      if (role) {
        permissions = role.permissions || {};
      }
    } catch (error) {
      console.log('Error fetching admin role permissions:', error);
    }
  }

  req.session.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    isSeller: user.isSeller,
    isAdmin: user.isAdmin,
    permissions: permissions,
    isSuperAdmin: user.isSuperAdmin,
    adminRole: user.adminRole
  };
};

// Check if user is logged in via session
export const checkLoggedIn = (req) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return true;
  }
  return false;
};

// Refresh user permissions in session (call after role updates)
export const refreshUserPermissions = async (req) => {
  if (req.session && req.session.user && req.session.user.adminRole) {
    try {
      const role = await AdminRole.findById(req.session.user.adminRole);
      if (role) {
        req.session.user.permissions = role.permissions || {};
        return true;
      }
    } catch (error) {
      console.log('Error refreshing user permissions:', error);
    }
  }
  return false;
};

export const generateOTPOf6Digits = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};