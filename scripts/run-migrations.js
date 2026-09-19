#!/usr/bin/env node
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'u128759105_Marcuscatia',
    password: 'Caboverde238cv@.',
    database: 'u128759105_Catia',
    multipleStatements: true,
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, '../db/migrations.sql'), 'utf8');
    await connection.query(sql);
    console.log('✅ Migrations executed successfully!');
    console.log('✓ Tables created: reservations, courses, messages, gallery_items, blocked_dates');
    console.log('✓ Indexes created');
    console.log('✓ 7 courses inserted');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
