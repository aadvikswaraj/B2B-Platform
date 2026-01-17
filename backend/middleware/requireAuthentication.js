import { checkLoggedIn } from "../utils/auth.js";

// Middleware to require login
export default function requireAuthentication(req, res, next) {
  if (!res.locals.isLoggedIn) {
    res.locals.response.success = false;
    res.locals.response.message = "Authentication required";
    return res.status(401).json(res.locals.response);
  }
  next();
}
