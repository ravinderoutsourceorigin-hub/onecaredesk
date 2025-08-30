import { query } from './src/config/database.js';

const createSignaturesTable = async () => {
  try {
    console.log('🏗️ Creating signatures table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS signatures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
        document_id VARCHAR(255),
        signer_email VARCHAR(255) NOT NULL,
        signer_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        signature_url TEXT,
        external_id VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await query(createTableSQL);
    console.log('✅ Signatures table created successfully!');
    
    // Also create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_signatures_agency_id ON signatures(agency_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_signatures_status ON signatures(status);');
    console.log('✅ Signatures table indexes created!');
    
  } catch (error) {
    console.error('❌ Error creating signatures table:', error);
  }
  process.exit(0);
};

createSignaturesTable();
