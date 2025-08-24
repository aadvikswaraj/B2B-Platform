import express from 'express';
import { AdminRole } from '../../models/model.js';
import { requirePermission } from '../../middleware/requireAdmin.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const roles = await AdminRole.find().lean();
  res.json({ success:true, data: roles });
});

router.post('/new', requirePermission('adminRoles','create'), async (req, res) => {
  const { roleName, isSuperAdmin=false, permissions={} } = req.body;
  if(permissions.adminRoles){
    const role = await AdminRole.create({ roleName, isSuperAdmin, permissions });
    res.locals.response.message = "Admin Role created successfully";
    return res.json(res.locals.response);
  }
  else{
    res.locals.response.success = false;
    res.locals.response.message = "Something went wrong";
    return res.json(res.locals.response);
  }
});

router.get('/:id', async (req, res) => {
  const role = await AdminRole.findById(req.params.id);
  if(!role) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data: role });
});

router.put('/:id', requirePermission('adminRoles','edit'), async (req, res) => {
  const { roleName, isSuperAdmin, permissions } = req.body;
  const role = await AdminRole.findByIdAndUpdate(req.params.id, { roleName, isSuperAdmin, permissions }, { new:true });
  if(!role) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data: role });
});

router.delete('/:id', requirePermission('adminRoles','delete'), async (req, res) => {
  const role = await AdminRole.findByIdAndDelete(req.params.id);
  if(!role) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data: true });
});

export default router;
