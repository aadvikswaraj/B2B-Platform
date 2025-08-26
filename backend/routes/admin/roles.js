import express from 'express';
import { AdminRole, adminPermissionsModules } from '../../models/model.js';
import { requirePermission } from '../../middleware/requireAdmin.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const roles = await AdminRole.find().lean();
  res.json({ success:true, data: roles });
});

router.get('/permission-modules', async (req, res) => {
  res.locals.response.data.permissionModules = adminPermissionsModules;
  res.locals.response.message = "Admin permissions modules fetched successfully";
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
    const adminRole = await AdminRole.create({ roleName, isSuperAdmin, permissions });
    res.locals.response.message = "Admin role created successfully";
  }
  catch {
    res.locals.response.success = false;
    res.locals.response.message = "Something went wrong";
  }
  return res.json(res.locals.response);
});

router.get('/:id', async (req, res) => {
  const role = await AdminRole.findById(req.params.id);
  if(!role) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data: role });
});

router.put('/:id', requirePermission('adminRoles','edit'), async (req, res) => {
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
  }
  res.json(res.locals.response);
});

export default router;
