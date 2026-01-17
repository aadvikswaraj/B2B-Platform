// responseTemplate.js - Middleware to standardize API responses
// Adds a default response object to res.locals for consistent API replies

import { checkLoggedIn } from "../utils/auth.js";

export function responseTemplate(req, res, next) {
  res.locals.isLoggedIn = checkLoggedIn(req);
  res.locals.response = {
    success: true,
    message: "",
    data: {},
    status: 200
  };
  next();
};

export function sendResponse(res) {
  return res.status(res.locals.response.status).json(res.locals.response);
}