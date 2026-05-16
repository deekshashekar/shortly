import "dotenv/config";
import express from "express";
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

app.post("/links", async (req, res) => {
  const url = req.body.url;
  const code = generateCode();
  const link = await prisma.link.create({ data: { code, url } });
  res.json({ code: link.code });
});

app.get("/:code", async (req, res) => {
  const link = await prisma.link.findUnique({ where: { code: req.params.code } });
  if (link) {
    res.redirect(link.url);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
