
export function requirePermission(module, action){
  return (req, res, next) => {
    if(req.session?.user?.adminRole?.isSuperAdmin) return next();
    const permissions = req.session?.user?.permissions || {};
    if(permissions[module]?.[action]) return next();
    res.locals.response.success = false;
    res.locals.response.message = 'Permission denied';
    return res.json(res.locals.response);
  }
}