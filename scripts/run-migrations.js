#!/usr/bin/env node
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !password || !database) {
    console.error('❌ Missing DB_HOST, DB_USER, DB_PASSWORD or DB_NAME environment variables.');
    console.error('   Set them (e.g. in .env, then `export $(cat .env | xargs)`) before running this script.');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true,
  });

  try {
    const sqlPath = path.join(__dirname, '../db/migrations.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ ${sqlPath} not found.`);
      console.error('   Use the /api/admin/migrate endpoint instead (POST with { secret }),');
      console.error('   which creates all tables directly and stays in sync with the API routes.');
      process.exit(1);
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await connection.query(sql);
    console.log('✅ Migrations executed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
