import "dotenv/config";
import express from "express";
import { z } from "zod";
import { authRouter } from "./routes/auth.js";
import { linksRouter } from "./routes/links.js";

const app = express();

app.use(express.json());
app.use(authRouter);
app.use(linksRouter);

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
