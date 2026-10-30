import fs from 'fs';
import path from 'path';
import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL || process.argv[2];
  if (!connectionString) {
    console.error('Error: Please provide your Supabase database connection string or password.');
    console.error('Usage: node database/run_migration.js "<connection_string>"');
    console.error('Example: node database/run_migration.js "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    // 1. Run Schema
    console.log('1/3 Applying database schema (creating all 23 tables & indexes)...');
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('Schema applied successfully.');

    // 2. Run Seed
    console.log('2/3 Seeding foundational data for all 16 operational sectors...');
    const seedSql = fs.readFileSync(path.join(process.cwd(), 'database', 'seed.sql'), 'utf8');
    await client.query(seedSql);
    console.log('Foundational data seeded successfully.');

    // 3. Run Bulk 765 Students Seed
    const bulkSeedPath = path.join(process.cwd(), 'database', 'seed_all_765_students.sql');
    if (fs.existsSync(bulkSeedPath)) {
      console.log('3/3 Bulk inserting 765 admitted students directory...');
      const bulkSql = fs.readFileSync(bulkSeedPath, 'utf8');
      await client.query(bulkSql);
      console.log('765 students inserted successfully.');
    }

    console.log('\nAll tables created and data inserted successfully into Supabase!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
