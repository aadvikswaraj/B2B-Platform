import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const makeLoggedIn = (user, res) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, isSeller: user.isSeller },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 3600000,
  });
};

export const checkLoggedIn = (req) => {
  const token = req.cookies.token;
  if (token) {
    const user = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = user;
  }
};