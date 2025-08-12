// responseTemplate.js - Middleware to standardize API responses
// Adds a default response object to res.locals for consistent API replies

export function responseTemplate(req, res, next) {
  res.locals.response = {
    success: true, // Indicates if the request was successful
    message: "",   // Message to send to client
    data: {}        // Data payload
  };
  next(); // Continue to next middleware/route handler
}