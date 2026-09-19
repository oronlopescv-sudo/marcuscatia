let pool: any;

export async function getPool() {
  if (pool) {
    return pool;
  }

  try {
    const mysql = require('mysql2/promise');
    
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    return pool;
  } catch (error) {
    console.error('MySQL pool initialization error:', error);
    throw new Error('Database connection failed. Ensure mysql2/promise is installed.');
  }
}

export async function query(sql: string, values?: any[]) {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();
    
    try {
      const [results] = await connection.execute(sql, values || []);
      return results;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function closePool() {
  if (pool) {
    try {
      await pool.end();
      pool = null;
    } catch (error) {
      console.error('Error closing pool:', error);
    }
  }
}
