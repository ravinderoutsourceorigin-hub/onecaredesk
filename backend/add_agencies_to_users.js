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

async function addAgenciesToUsers() {
  try {
    console.log('🔍 Finding users without agencies...');

    // Find users without agency_id
    const usersResult = await pool.query(`
      SELECT id, email, first_name, last_name, role
      FROM users 
      WHERE agency_id IS NULL 
      AND role != 'super_admin'
      AND role != 'admin'
    `);

    const users = usersResult.rows;
    console.log(`📊 Found ${users.length} users without agencies`);

    if (users.length === 0) {
      console.log('✅ All users already have agencies!');
      return;
    }

    for (const user of users) {
      console.log(`\n🔧 Processing user: ${user.email}`);
      
      // Create personal agency
      const agencyName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}'s Agency`
        : `${user.email.split('@')[0]}'s Agency`;

      const agencyResult = await pool.query(
        `INSERT INTO agencies (name, address, phone, email, created_date, updated_date)
         VALUES ($1, '', '', $2, NOW(), NOW())
         RETURNING id, name`,
        [agencyName, user.email]
      );

      const agency = agencyResult.rows[0];
      console.log(`  ✅ Created agency: ${agency.name} (${agency.id})`);

      // Update user with agency_id
      await pool.query(
        'UPDATE users SET agency_id = $1, updated_date = NOW() WHERE id = $2',
        [agency.id, user.id]
      );

      console.log(`  ✅ Updated user ${user.email} with agency_id`);
    }

    console.log('\n✅ All users now have agencies!');

  } catch (error) {
    console.error('❌ Error adding agencies to users:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addAgenciesToUsers()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
