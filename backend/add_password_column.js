import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

async function addPasswordColumn() {
  try {
    console.log('🔧 Adding password and username columns to users table...');

    // Add password column (nullable to allow OAuth users)
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255),
      ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
    `);

    console.log('✅ Password, username, and last_login columns added successfully!');
    console.log('📝 Note: password column is nullable to support both OAuth and password-based auth');

    // Show current table structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Current users table structure:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error adding password column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addPasswordColumn()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
