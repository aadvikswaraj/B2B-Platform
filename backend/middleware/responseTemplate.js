// responseTemplate.js - Middleware to standardize API responses
// Adds a default response object to res.locals for consistent API replies

import { checkLoggedIn } from "../utils/auth.js";

export function responseTemplate(req, res, next) {
  res.locals.isLoggedIn = checkLoggedIn(req);
  res.locals.response = {
    success: true,
    message: "",
    data: {}
  };
  next();
};