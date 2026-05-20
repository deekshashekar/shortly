import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaNeonHttp } from "@prisma/adapter-neon";

let _prisma = null;

function getClient() {
  if (!_prisma) {
    const adapter = new PrismaNeonHttp(process.env.DATABASE_URL);
    _prisma = new PrismaClient({ adapter });
  }
  return _prisma;
}

export const prisma = new Proxy({}, {
  get(_, prop) {
    return getClient()[prop];
  },
});
