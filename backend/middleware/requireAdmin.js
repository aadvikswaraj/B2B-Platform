export default function requireAdmin(req, res, next) {
  if (req.session?.user?.isAdmin) {
    return next();
  }
  res.locals.response.success = false;
  res.locals.response.message = "Admin access required";
  return res.status(403).json(res.locals.response);
}
