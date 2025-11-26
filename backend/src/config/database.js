const mysql = require('mysql2/promise');

// Configuração do pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'paresi_app',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'paresi_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
});

// Testar conexão
pool.getConnection()
  .then(connection => {
    console.log('✓ Conectado ao banco de dados MySQL/MariaDB');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  });

// Helper para executar queries
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
};

// Helper para transações
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  transaction
};
