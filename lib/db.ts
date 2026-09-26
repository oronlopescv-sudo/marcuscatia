let pool: any = null;

async function createPool() {
  try {
    const mysql = await import('mysql2/promise');
    
    // Require environment variables in production
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;
    
    if (!host || !user || !password || !database) {
      console.warn('⚠️ Missing database credentials in environment variables');
      return null;
    }
    
    return mysql.createPool({
      host,
      port: Number(process.env.DB_PORT) || 3306,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      // Return DECIMAL columns (prices) as numbers, not strings, so sums work.
      decimalNumbers: true,
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

export async function query(sql: string, values?: (string | number | boolean | null | Buffer)[]) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values || []);
    return results;
  } finally {
    connection.release();
  }
}

export { getPool as default };
