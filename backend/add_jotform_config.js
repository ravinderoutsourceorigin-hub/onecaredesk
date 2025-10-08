import { pool, connectDB } from './src/config/database.js';

async function addJotFormConfig() {
  try {
    // Test connection first
    await connectDB();
    
    // Connect to database
    const client = await pool.connect();
    
    // Add JotForm API key configuration (using a test key for now)
    const jotformApiKey = 'your_jotform_api_key_here'; // Replace with actual key
    
    // Check if JotForm API key exists and update or insert
    const jotformCheck = await client.query(
      'SELECT id FROM configurations WHERE agency_id IS NULL AND key = $1',
      ['jotform_api_key']
    );
    
    if (jotformCheck.rows.length > 0) {
      await client.query(
        'UPDATE configurations SET value = $1, updated_date = NOW() WHERE agency_id IS NULL AND key = $2',
        [jotformApiKey, 'jotform_api_key']
      );
    } else {
      await client.query(`
        INSERT INTO configurations (id, agency_id, is_global, key, value, description, created_date, updated_date)
        VALUES (gen_random_uuid(), NULL, true, $1, $2, $3, NOW(), NOW())
      `, [
        'jotform_api_key',
        jotformApiKey,
        'JotForm API key for form integration'
      ]);
    }
    
    // Add Resend configuration  
    const resendApiKey = 'your_resend_api_key_here'; // Replace with actual key
    const resendCheck = await client.query(
      'SELECT id FROM configurations WHERE agency_id IS NULL AND key = $1',
      ['resend_api_key']
    );
    
    if (resendCheck.rows.length > 0) {
      await client.query(
        'UPDATE configurations SET value = $1, updated_date = NOW() WHERE agency_id IS NULL AND key = $2',
        [resendApiKey, 'resend_api_key']
      );
    } else {
      await client.query(`
        INSERT INTO configurations (id, agency_id, is_global, key, value, description, created_date, updated_date)
        VALUES (gen_random_uuid(), NULL, true, $1, $2, $3, NOW(), NOW())
      `, [
        'resend_api_key',
        resendApiKey,
        'Resend API key for email notifications'
      ]);
    }
    
    // Add default from email settings
    const fromEmailCheck = await client.query(
      'SELECT id FROM configurations WHERE agency_id IS NULL AND key = $1',
      ['resend_from_email']
    );
    
    if (fromEmailCheck.rows.length > 0) {
      await client.query(
        'UPDATE configurations SET value = $1, updated_date = NOW() WHERE agency_id IS NULL AND key = $2',
        ['noreply@yourdomain.com', 'resend_from_email']
      );
    } else {
      await client.query(`
        INSERT INTO configurations (id, agency_id, is_global, key, value, description, created_date, updated_date)
        VALUES (gen_random_uuid(), NULL, true, $1, $2, $3, NOW(), NOW())
      `, [
        'resend_from_email',
        'noreply@yourdomain.com',
        'Default from email address for Resend'
      ]);
    }
    
    const fromNameCheck = await client.query(
      'SELECT id FROM configurations WHERE agency_id IS NULL AND key = $1',
      ['resend_from_name']
    );
    
    if (fromNameCheck.rows.length > 0) {
      await client.query(
        'UPDATE configurations SET value = $1, updated_date = NOW() WHERE agency_id IS NULL AND key = $2',
        ['OneCare Desk', 'resend_from_name']
      );
    } else {
      await client.query(`
        INSERT INTO configurations (id, agency_id, is_global, key, value, description, created_date, updated_date)
        VALUES (gen_random_uuid(), NULL, true, $1, $2, $3, NOW(), NOW())
      `, [
        'resend_from_name',
        'OneCare Desk',
        'Default from name for emails'
      ]);
    }
    
    console.log('✅ JotForm and Resend configurations added successfully');
    client.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error adding configurations:', error.message);
    process.exit(1);
  }
}

addJotFormConfig();