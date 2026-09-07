import mysql from 'mysql2/promise';

let pool;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      database: process.env.DB_NAME || 'dailyhukamnama.in',
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = getDb();
  const [results] = await db.query(sql, params);
  return results;
}

const poolProxy = {
  query: (sql, params) => getDb().query(sql, params),
  execute: (sql, params) => getDb().execute(sql, params),
  getConnection: () => getDb().getConnection(),
};

export default poolProxy;

