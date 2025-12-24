import "dotenv/config";
import * as pg from "pg";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const setUpDB = async () => {
  try {
    const { DATABASE_URL, DATABASE_NAME, ROOT_DATABASE_URL} = process.env;

    if (!DATABASE_NAME || !ROOT_DATABASE_URL || !DATABASE_URL) {
      throw new Error("Missing required env vars in .env file");
    }

    const SHADOW_DB_NAME = `${DATABASE_NAME}_shadow`;

    console.log("🚧 Setting up local PostgreSQL environment...");

    const pgPool = new pg.Pool({ connectionString: ROOT_DATABASE_URL });

    let attempts = 0;
    while (true) {
      try {
        await pgPool.query('select true as "Connection test";');
        break;
      } catch (e) {
        attempts++;
        if (attempts > 10) {
          console.error("❌ Database never came up, aborting.");
          process.exit(1);
        }
        console.log(`Database not ready yet (attempt ${attempts})...`);
        await sleep(1000);
      }
    }

    const client = await pgPool.connect();

    try {
      console.log(`🧹 Dropping existing connections to ${DATABASE_NAME} and ${SHADOW_DB_NAME}...`);
      

      await client.query(`
        SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
        WHERE datname IN ('${DATABASE_NAME}', '${SHADOW_DB_NAME}') AND pid <> pg_backend_pid();
      `);

      console.log("🗑️ Dropping and Recreating databases...");
      await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME};`);
      
      await client.query(`CREATE DATABASE ${DATABASE_NAME};`);
      await client.query(`CREATE DATABASE ${SHADOW_DB_NAME};`);
      
    } finally {
      client.release();
    }

    await pgPool.end(); 

    console.log("🔌 Installing extensions on main database...");
    const ownerPgPool = new pg.Pool({ connectionString: DATABASE_URL });
    const ownerClient = await ownerPgPool.connect();
    
    try {
      await ownerClient.query(`
        CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
        CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
        CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
        
      `);
    } finally {
      ownerClient.release();
    }
    await ownerPgPool.end();

    console.log("✅ Local database setup complete!");
  } catch (err) {
    console.error("❌ Setup failed. Check your .env configuration.");
    console.error(err);
  }
};

setUpDB();