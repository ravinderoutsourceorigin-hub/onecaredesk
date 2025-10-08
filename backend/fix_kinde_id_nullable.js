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

async function fixKindeIdColumn() {
  try {
    console.log('🔧 Making kinde_id column nullable to support password-based auth...');

    // Make kinde_id nullable
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN kinde_id DROP NOT NULL
    `);

    console.log('✅ kinde_id column is now nullable!');
    console.log('📝 This allows users to sign up with email/password without Kinde OAuth');

    // Show updated column info
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'kinde_id'
    `);

    console.log('\n📊 Updated kinde_id column:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error making kinde_id nullable:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixKindeIdColumn()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
