import oracledb from 'oracledb';
import { createPool } from 'generic-pool';

// Database configuration with optimized settings
const DB_CONFIG = {
  user: process.env.DB_USER || 'edux',
  password: process.env.DB_PASSWORD || 'edux',
  connectString: process.env.DB_URL || 'oracle-db:1521/EDUX',
};

// Pool configuration for optimal performance
const POOL_CONFIG = {
  max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  evictionRunIntervalMillis: 60000,
  softIdleTimeoutMillis: 20000,
  testOnBorrow: true,
};

// Set Oracle client configuration for better performance
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;
oracledb.fetchArraySize = 100;

// Create optimized connection pool
const pool = createPool({
  create: async () => {
    try {
      const connection = await oracledb.getConnection(DB_CONFIG);
      
      // Set session parameters for better performance
      await connection.execute(`ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS'`);
      
      return connection;
    } catch (error) {
      console.error('Database connection error:', error.message);
      throw error;
    }
  },
  destroy: async (connection) => {
    try {
      await connection.close();
    } catch (error) {
      console.error('Error closing connection:', error.message);
    }
  },
  validate: async (connection) => {
    try {
      await connection.execute('SELECT 1 FROM DUAL');
      return true;
    } catch (error) {
      return false;
    }
  },
}, POOL_CONFIG);

// Pool statistics
pool.on('factoryCreateError', (err) => {
  console.error('Pool create error:', err.message);
});

pool.on('factoryDestroyError', (err) => {
  console.error('Pool destroy error:', err.message);
});

/**
 * Get pool statistics
 * @returns {Object} - Pool statistics
 */
export function getPoolStats() {
  return {
    size: pool.size,
    available: pool.available,
    borrowed: pool.borrowed,
    pending: pool.pending,
    max: pool.max,
    min: pool.min,
  };
}

/**
 * Execute query with automatic connection management
 * @param {string} sql - SQL query
 * @param {Object} params - Query parameters
 * @param {Object} options - Query options
 * @returns {Promise} - Query result
 */
export async function executeQuery(sql, params = {}, options = {}) {
  let connection;
  try {
    connection = await pool.acquire();
    const result = await connection.execute(sql, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options,
    });
    return result;
  } finally {
    if (connection) {
      pool.release(connection);
    }
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Transaction callback
 * @returns {Promise} - Transaction result
 */
export async function executeTransaction(callback) {
  let connection;
  try {
    connection = await pool.acquire();
    
    // Disable autocommit for transaction
    const originalAutoCommit = connection.autoCommit;
    connection.autoCommit = false;
    
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.autoCommit = originalAutoCommit;
    }
  } finally {
    if (connection) {
      pool.release(connection);
    }
  }
}

export default pool;