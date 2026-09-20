let pool: any = null;

async function createPool() {
  try {
    const mysql = await import('mysql2/promise');
    return mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'u128759105_Marcuscatia',
      password: process.env.DB_PASSWORD || 'f5Zy*2M@',
      database: process.env.DB_NAME || 'u128759105_Catia',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } catch (err) {
    console.warn('⚠️ mysql2/promise not available (normal in local dev)');
    return null;
  }
}

async function getPool() {
  if (!pool) {
    pool = await createPool();
  }
  return pool;
}

export async function getConnection() {
  const p = await getPool();
  if (!p) throw new Error('Database not connected');
  return p.getConnection();
}

export async function query(sql: string, values?: (string | number | boolean | null)[]) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values || []);
    return results;
  } finally {
    connection.release();
  }
}

export { getPool as default };
