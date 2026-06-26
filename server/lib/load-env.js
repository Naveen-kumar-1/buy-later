import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env relative to this file to ensure Cwd independence
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log(`[Env Loader] Loaded env statically. DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);

// Parse DATABASE_URL and populate PG* standard environment variables
if (process.env.DATABASE_URL) {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    process.env.PGHOST = dbUrl.hostname;
    process.env.PGUSER = dbUrl.username;
    process.env.PGPASSWORD = dbUrl.password;
    process.env.PGDATABASE = dbUrl.pathname.replace(/^\//, '');
    process.env.PGPORT = dbUrl.port || '5432';
    
    console.log(`[Env Loader] Parsed DATABASE_URL: PGHOST=${process.env.PGHOST}, PGUSER=${process.env.PGUSER}, PGDATABASE=${process.env.PGDATABASE}`);
  } catch (err) {
    console.error("[Env Loader] Failed to parse DATABASE_URL as URL:", err.message);
  }
}
