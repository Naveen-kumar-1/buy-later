import './load-env.js';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure the WebSocket constructor for Node.js environments
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

console.log("[Prisma.js] Initializing Pool. connectionString:", connectionString ? (connectionString.substring(0, 25) + "...") : "undefined");

if (!connectionString) {
  console.error("CRITICAL ERROR: DATABASE_URL is not defined in the environment.");
}

const pool = new Pool({ connectionString });

const adapter = new PrismaNeon(pool, { ws });

const prisma = new PrismaClient({ adapter });

export default prisma;