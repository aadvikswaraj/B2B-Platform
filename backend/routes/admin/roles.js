import express from "express";
import { User, AdminRole, adminPermissionsModules } from "../../models/model.js";
import { requirePermission } from "../../middleware/requireAdmin.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { search, sort, page = 1, pageSize = 10 } = req.query;
  try {
    const query = {
      ...(search && { roleName: { $regex: search, $options: "i" } }),
    };
    const sortObj =
      sort && sort.field
        ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
        : { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const roles = await AdminRole.find(query)
      .select("-__v -createdAt")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean();
    res.locals.response.message = "Admin roles fetched successfully";
    const totalCount = await AdminRole.countDocuments(query);
    res.locals.response.data = {
      roles,
      totalCount,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    };
    return res.json(res.locals.response);
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

// Quick suggestions for autocomplete (role picker)
router.get("/suggest", async (req, res) => {
  try {
    const { q = "", limit = 10 } = req.query;
    const filter = q ? { roleName: { $regex: q, $options: "i" } } : {};
    const roles = await AdminRole.find(filter)
      .select("roleName isSuperAdmin isActive")
      .limit(parseInt(limit) || 10)
      .lean();
    res.locals.response.data = { roles };
    return res.json(res.locals.response);
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

// Summary stats (active/inactive counts, super admin count)
router.get("/summary", async (req, res) => {
  try {
    const [total, active, superAdmins] = await Promise.all([
      AdminRole.countDocuments({}),
      AdminRole.countDocuments({ isActive: true }),
      AdminRole.countDocuments({ isSuperAdmin: true }),
    ]);
    res.locals.response.data = {
      total,
      active,
      inactive: total - active,
      superAdmins,
    };
    return res.json(res.locals.response);
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

// Bulk activate/deactivate roles
router.post(
  "/bulk/status",
  requirePermission("adminRoles", "edit"),
  async (req, res) => {
    try {
      const { ids = [], isActive } = req.body;
      if (!Array.isArray(ids) || typeof isActive !== "boolean") {
        res.locals.response.success = false;
        res.locals.response.message = "Invalid payload";
        return res.status(400).json(res.locals.response);
      }
      const result = await AdminRole.updateMany(
        { _id: { $in: ids } },
        { $set: { isActive } }
      );
      res.locals.response.message = "Status updated";
      res.locals.response.data = {
        matched: result.matchedCount || result.n,
        modified: result.modifiedCount || result.nModified,
      };
      return res.json(res.locals.response);
    } catch (e) {
      res.locals.response.success = false;
      res.locals.response.message = "Internal server error";
      return res.status(500).json(res.locals.response);
    }
  }
);

router.get(
  "/:id/users",
  requirePermission("users", "view"),
  async (req, res) => {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const [users, total] = await Promise.all([
        User.find({ adminRole: req.params.id })
          .select("name email createdAt")
          .skip(skip)
          .limit(parseInt(pageSize))
          .lean(),
        User.countDocuments({ adminRole: req.params.id }),
      ]);
      res.locals.response.data = {
        users,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      };
      return res.json(res.locals.response);
    } catch (e) {
      res.locals.response.success = false;
      res.locals.response.message = "Internal server error";
      return res.status(500).json(res.locals.response);
    }
  }
);

// Clone role
router.post(
  "/:id/clone",
  requirePermission("adminRoles", "create"),
  async (req, res) => {
    try {
      const source = await AdminRole.findById(req.params.id).lean();
      if (!source) {
        res.locals.response.success = false;
        res.locals.response.message = "Role not found";
        return res.status(404).json(res.locals.response);
      }
      const { roleName } = req.body;
      if (!roleName) {
        res.locals.response.success = false;
        res.locals.response.message = "roleName required";
        return res.status(400).json(res.locals.response);
      }
      const clone = await AdminRole.create({
        roleName,
        isSuperAdmin: source.isSuperAdmin,
        permissions: source.permissions,
        isActive: true,
      });
      res.locals.response.data = { role: clone };
      res.locals.response.message = "Role cloned";
      return res.json(res.locals.response);
    } catch (e) {
      res.locals.response.success = false;
      res.locals.response.message =
        e.code === 11000 ? "Role name already exists" : "Clone failed";
      return res.status(400).json(res.locals.response);
    }
  }
);

router.get("/:id/users-count", async (req, res) => {
  const { id } = req.params;
  try {
    const count = await User.countDocuments({ adminRole: id });
    res.locals.response.message = "users count fetched successfully";
    res.locals.response.data = { count };
    return res.json(res.locals.response);
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

const checkValidPermissionsModules = (req, res, next) => {
  const { permissions } = req.body;
  if (!permissions) return next();
  for (const module in permissions) {
    if (!adminPermissionsModules[module]) {
      res.locals.response.success = false;
      res.locals.response.message = `Invalid permissions module: ${module}`;
      return res.status(400).json(res.locals.response);
    }
    const perms = permissions[module];
    for (const perm in perms) {
      if (!adminPermissionsModules[module].includes(perm)) {
        res.locals.response.success = false;
        res.locals.response.message = `Invalid permission '${perm}' for module '${module}'`;
        return res.status(400).json(res.locals.response);
      }
    }
  }
  next();
};

router.post(
  "/new",
  checkValidPermissionsModules,
  requirePermission("adminRoles", "create"),
  async (req, res) => {
    const { roleName, isSuperAdmin = false, permissions = {} } = req.body;
    try {
      await AdminRole.create({ roleName, isSuperAdmin, permissions });
      res.locals.response.message = "Admin role created successfully";
      return res.json(res.locals.response);
    } catch (error) {
      res.locals.response.success = false;
      res.locals.response.message =
        error.code === 11000
          ? "Role name already exists"
          : "Something went wrong";
      return res.status(400).json(res.locals.response);
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const role = await AdminRole.findById(req.params.id).select(
      "-__v -updatedAt"
    );
    if (!role) {
      res.locals.response.success = false;
      res.locals.response.message = "Not found";
      return res.status(404).json(res.locals.response);
    }
    res.locals.response.message = "Role fetched successfully";
    res.locals.response.data = role;
    return res.json(res.locals.response);
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Internal server error";
    return res.status(500).json(res.locals.response);
  }
});

router.delete(
  "/:id",
  requirePermission("adminRoles", "delete"),
  async (req, res) => {
    const { id } = req.params;
    try {
      await AdminRole.findByIdAndDelete(id);
      res.locals.response.message = "Role deleted successfully";
      return res.json(res.locals.response);
    } catch (e) {
      res.locals.response.success = false;
      res.locals.response.message = "Internal server error";
      return res.status(500).json(res.locals.response);
    }
  }
);

// Delete with strategy: reassign or delete-users
router.post(
  "/:id/delete-with-strategy",
  requirePermission("adminRoles", "delete"),
  async (req, res) => {
    const { id } = req.params;
    const { strategy, targetRoleId } = req.body || {};
    try {
      const role = await AdminRole.findById(id);
      if (!role) {
        res.locals.response.success = false;
        res.locals.response.message = "Role not found";
        return res.status(404).json(res.locals.response);
      }
  // Allow deleting Super Admin roles as requested

      const users = await User.find({ adminRole: id }).select("_id");
      const userIds = users.map((u) => u._id);

      if (userIds.length > 0) {
        if (strategy === "reassign") {
          if (!targetRoleId) {
            res.locals.response.success = false;
            res.locals.response.message = "targetRoleId required for reassignment";
            return res.status(400).json(res.locals.response);
          }
          if (String(targetRoleId) === String(id)) {
            res.locals.response.success = false;
            res.locals.response.message = "targetRoleId cannot equal source role";
            return res.status(400).json(res.locals.response);
          }
          const targetRole = await AdminRole.findById(targetRoleId).select("_id isActive");
          if (!targetRole) {
            res.locals.response.success = false;
            res.locals.response.message = "Target role not found";
            return res.status(404).json(res.locals.response);
          }
          await User.updateMany({ _id: { $in: userIds } }, { $set: { adminRole: targetRoleId } });
        } else if (strategy === "delete-users") {
          await User.deleteMany({ _id: { $in: userIds } });
        } else if (strategy && strategy !== "none") {
          res.locals.response.success = false;
          res.locals.response.message = "Invalid strategy";
          return res.status(400).json(res.locals.response);
        }
      }

      await AdminRole.findByIdAndDelete(id);
      res.locals.response.message = "Role deleted successfully";
      res.locals.response.data = { affectedUsers: userIds.length };
      return res.json(res.locals.response);
    } catch (e) {
      res.locals.response.success = false;
      res.locals.response.message = "Internal server error";
      return res.status(500).json(res.locals.response);
    }
  }
);

router.delete(
  "/bulk/delete",
  requirePermission("adminRoles", "delete"),
  async (req, res) => {
    const { ids } = req.body;
    try {
      await AdminRole.deleteMany({ _id: { $in: ids } });
      res.locals.response.message = "Roles deleted successfully";
      return res.json(res.locals.response);
    } catch (e) {
      res.locals.response.success = false;
      res.locals.response.message = "Internal server error";
      return res.status(500).json(res.locals.response);
    }
  }
);

router.post(
  "/:id/edit",
  requirePermission("adminRoles", "edit"),
  async (req, res) => {
    try {
      const { roleName, isSuperAdmin, permissions } = req.body;
      const role = await AdminRole.findByIdAndUpdate(
        { _id: req.params.id },
        { roleName, isSuperAdmin, permissions }
      );
      if (!role) {
        res.locals.response.success = false;
        res.locals.response.message = "Role not found";
        return res.status(404).json(res.locals.response);
      }
      // Update sessions for all users with this role (best-effort)
      if (req.sessionStore && req.sessionStore.all) {
        req.sessionStore.all((err, sessions) => {
          if (!err && sessions) {
            Object.keys(sessions).forEach((sessionId) => {
              const session = sessions[sessionId];
              if (session.user && session.user.adminRole === req.params.id) {
                session.user.permissions = permissions;
                req.sessionStore.set(sessionId, session, () => {});
              }
            });
          }
        });
      }
      res.locals.response.message = "Role updated successfully";
      return res.json(res.locals.response);
    } catch (e) {
      res.locals.response.success = false;
      res.locals.response.message = "Internal server error";
      return res.status(500).json(res.locals.response);
    }
  }
);

export default router;
