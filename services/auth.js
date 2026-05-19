import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = (password) => bcrypt.hash(password, 10);

export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

export const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
