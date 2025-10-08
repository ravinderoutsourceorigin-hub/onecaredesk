import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  },
  max: 10, // Reduced pool size for Neon
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased timeout
  query_timeout: 60000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
export const connectDB = async () => {
  let client;
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`🔄 Attempting to connect to database... (${4 - retries}/3)`);
      client = await pool.connect();
      console.log('✅ PostgreSQL Connected successfully');
      
      // Test query
      const result = await client.query('SELECT NOW()');
      console.log('🕐 Database time:', result.rows[0].now);
      
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${4 - retries} failed:`, error.message);
      retries--;
      
      if (client) client.release();
      
      if (retries === 0) {
        console.error('❌ All connection attempts failed. Database unavailable.');
        console.error('💡 Tip: Check if Neon database is active and not suspended');
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Query helper function
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
};

// Transaction helper
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});
