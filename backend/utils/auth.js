
// Set user info in session after successful login
export const makeLoggedIn = (req, user) => {
  req.session.user = {
    name: user.name,
    email: user.email,
    isSeller: user.isSeller,
    isAdmin: user.isAdmin,
    permissions: user.permissions,
    isSuperAdmin: user.isSuperAdmin
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

export const generateOTPOf6Digits = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};