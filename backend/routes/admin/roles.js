import express from 'express';
import { AdminRole, adminPermissionsModules } from '../../models/model.js';
import { requirePermission } from '../../middleware/requireAdmin.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { search, filters, sort, page, pageSize } = req.query;
    try {
      // Build the query object
      const query = {
        ...(search && { roleName: { $regex: search, $options: 'i' } }),
      };
  
      // Build sort object
      const sortObj = sort ? { [sort.field]: sort.order === 'desc' ? -1 : 1 } : { createdAt: -1 };
  
      // Calculate skip for pagination
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
  
      // Execute query with pagination
      const roles = await AdminRole.find(query)
        .select('-__v -createdAt')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(pageSize)).lean();
      const totalCount = await AdminRole.countDocuments(query);

      res.locals.response.data.roles = roles;
      res.locals.response.data.totalCount = totalCount;
    } catch {
      res.locals.response.success = false;
      res.locals.response.error = 'Internal server error';
    };
    res.json(res.locals.response);
});

router.get('/users-count', async (req, res) => {
  const { id } = req.params;
  try {
    const count = await AdminRole.countDocuments({ _id: id });
    res.locals.response.data = { count };
  } catch {
    res.locals.response.success = false;
    res.locals.response.error = 'Internal server error';
  }
  res.json(res.locals.response);
});

const checkValidPermissionsModules = (req, res, next) => {
  const { permissions } = req.body;
  if(permissions) {
    for(const module in permissions) {
      if(!adminPermissionsModules[module]) {
        res.locals.response.success = false;
        res.locals.response.message = `Invalid permissions module: ${module}`;
        return res.json(res.locals.response);
      }
      const perms = permissions[module];
      for(const perm in perms) {
        if(!adminPermissionsModules[module].includes(perm)) {
          res.locals.response.success = false;
          res.locals.response.message = `Invalid permission '${perm}' for module '${module}'`;
          return res.json(res.locals.response);
        }
      }
    }
    next();
  }
};

router.post('/new', checkValidPermissionsModules, requirePermission('adminRoles','create'), async (req, res) => {
  const { roleName, isSuperAdmin=false, permissions={} } = req.body;
  try {
    await AdminRole.create({ roleName, isSuperAdmin, permissions });
    res.locals.response.message = "Admin role created successfully";
  }
  catch (error) {
    res.locals.response.message = (error.code === 11000 ? "Role name already exists" : "Something went wrong");
    res.locals.response.success = false;
  }
  return res.json(res.locals.response);
});

router.get('/:id', async (req, res) => {
  const role = await AdminRole.findById(req.params.id)
  .select('-__v -updatedAt');
  if(!role) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data: role });
});

router.delete('/:id', requirePermission('adminRoles','delete'), async (req, res) => {
  const { id } = req.params;
  try {
    await AdminRole.findByIdAndDelete(id);
    res.locals.response.message = "Role deleted successfully";
  } catch {
    res.locals.response.success = false;
    res.locals.response.error = 'Internal server error';
  }
  res.json(res.locals.response);
});

router.delete('/bulk/delete', requirePermission('adminRoles','delete'), async (req, res) => {
  const { ids } = req.body;
  try {
    await AdminRole.deleteMany({ _id: { $in: ids } });
    res.locals.response.message = "Roles deleted successfully";
  } catch {
    res.locals.response.success = false;
    res.locals.response.error = 'Internal server error';
  }
  res.json(res.locals.response);
});

router.post('/:id/edit', requirePermission('adminRoles','edit'), async (req, res) => {
  const { roleName, isSuperAdmin, permissions } = req.body;
  const role = await AdminRole.findByIdAndUpdate({
    _id: req.params.id
  }, { roleName, isSuperAdmin, permissions });
  
  if (!role) {
    res.locals.response.success = false;
    res.locals.response.message = "Role not found";
  }
  else {
    res.locals.response.message = "Role updated successfully";
    
    // Update sessions for all users with this role
    // Note: In production, consider using Redis or a session store that supports updates
    if (req.sessionStore && req.sessionStore.all) {
      req.sessionStore.all((err, sessions) => {
        if (!err && sessions) {
          Object.keys(sessions).forEach(sessionId => {
            const session = sessions[sessionId];
            if (session.user && session.user.adminRole === req.params.id) {
              // Update the permissions in the session
              session.user.permissions = permissions;
              req.sessionStore.set(sessionId, session, () => {});
            }
          });
        }
      });
    }
  }
  res.json(res.locals.response);
});

export default router;