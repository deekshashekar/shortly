import { prisma } from "../db.js";

const generateCode = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const createLink = (url, userId) =>
  prisma.link.create({ data: { code: generateCode(), url, userId } });

export const findLinkByCode = (code) =>
  prisma.link.findUnique({ where: { code } });

export const getLinksByUser = (userId) =>
  prisma.link.findMany({ where: { userId } });
