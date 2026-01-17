export default function requireSeller(req, res, next) {
  if (req.session?.user?.isSeller) {
    return next();
  }
  res.locals.response.success = false;
  res.locals.response.message = "Seller access required";
  return res.status(403).json(res.locals.response);
}
