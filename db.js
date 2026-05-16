import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
export const prisma = new PrismaClient({ adapter });
