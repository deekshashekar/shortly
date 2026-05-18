import "dotenv/config";
import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db.js";

const app = express();

app.use(express.json());

const generateCode = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const requireAuth = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const linkSchema = z.object({
  url: z.string().url({ message: "Invalid URL" }),
});

app.post("/links", requireAuth, async (req, res, next) => {
  try {
    const { url } = linkSchema.parse(req.body);
    const code = generateCode();
    const link = await prisma.link.create({
      data: { code, url, userId: req.user.sub },
    });
    res.json({ code: link.code });
  } catch (err) {
    next(err);
  }
});

app.get("/:code", async (req, res, next) => {
  try {
    const link = await prisma.link.findUnique({
      where: { code: req.params.code },
    });
    if (link) {
      res.redirect(link.url);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  } catch (err) {
    next(err);
  }
});

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

app.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = signupSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

app.get("/me/links", requireAuth, async (req, res, next) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId: req.user.sub },
    });
    res.json(links);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: err.errors[0].message });
  }
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Email already exists" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
