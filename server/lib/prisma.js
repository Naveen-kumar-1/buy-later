import './load-env.js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

console.log("[Prisma.js] Initializing PG Pool. connectionString:", connectionString ? (connectionString.substring(0, 25) + "...") : "undefined");

if (!connectionString) {
  console.error("CRITICAL ERROR: DATABASE_URL is not defined in the environment.");
}

const pool = new pg.Pool({ connectionString });

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;