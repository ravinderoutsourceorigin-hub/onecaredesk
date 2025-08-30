// Test leads database directly
import { query } from './backend/src/config/database.js';

const testLeadsDatabase = async () => {
  try {
    console.log('🔍 Testing leads database...');
    
    // Test 1: Check if leads table exists and its structure
    console.log('1. Checking leads table structure...');
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'leads' 
      ORDER BY ordinal_position
    `);
    
    if (tableInfo.rows.length === 0) {
      console.log('❌ No leads table found!');
      return;
    }
    
    console.log('✅ Leads table structure:');
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Test 2: Try to create a lead
    console.log('\n2. Testing lead creation...');
    const testLead = await query(
      'INSERT INTO leads (name, email, phone, status, created_date, updated_date) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      ['Test Lead', 'test@example.com', '555-0123', 'new']
    );
    
    console.log('✅ Lead created successfully:', testLead.rows[0]);
    
    // Test 3: Fetch all leads
    console.log('\n3. Testing lead retrieval...');
    const allLeads = await query('SELECT * FROM leads ORDER BY created_date DESC');
    console.log(`✅ Found ${allLeads.rows.length} leads total`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  }
};

testLeadsDatabase();
