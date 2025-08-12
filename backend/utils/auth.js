
// Set user info in session after successful login
export const makeLoggedIn = (req, user) => {
  req.session.user = {
    name: user.name,
    email: user.email,
    isSeller: user.isSeller
  };
};

// Check if user is logged in via session
export const checkLoggedIn = (req) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return true;
  }
  return false;
};