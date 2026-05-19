import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { hashPassword, verifyPassword, signToken } from "../services/auth.js";

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

authRouter.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = signupSchema.parse(req.body);
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ token: signToken(user) });
  } catch (err) {
    next(err);
  }
});
