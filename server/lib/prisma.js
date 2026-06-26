import './load-env.js';
import { PrismaClient } from '@prisma/client';

console.log("[Prisma.js] Initializing PrismaClient. DATABASE_URL exists:", !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error("CRITICAL ERROR: DATABASE_URL is not defined in the environment.");
}

const prisma = new PrismaClient();

export default prisma;