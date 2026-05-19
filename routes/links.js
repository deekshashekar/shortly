import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { createLink, findLinkByCode, getLinksByUser } from "../services/links.js";

export const linksRouter = Router();

const linkSchema = z.object({
  url: z.string().url({ message: "Invalid URL" }),
});

linksRouter.post("/links", requireAuth, async (req, res, next) => {
  try {
    const { url } = linkSchema.parse(req.body);
    const link = await createLink(url, req.user.sub);
    res.json({ code: link.code });
  } catch (err) {
    next(err);
  }
});

linksRouter.get("/me/links", requireAuth, async (req, res, next) => {
  try {
    const links = await getLinksByUser(req.user.sub);
    res.json(links);
  } catch (err) {
    next(err);
  }
});

linksRouter.get("/:code", async (req, res, next) => {
  try {
    const link = await findLinkByCode(req.params.code);
    if (link) {
      res.redirect(link.url);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  } catch (err) {
    next(err);
  }
});
