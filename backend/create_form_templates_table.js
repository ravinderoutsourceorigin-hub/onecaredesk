import { connectDB } from './src/config/database.js';

async function createFormTemplatesTable() {
  const client = await connectDB();
  
  try {
    await client.query('BEGIN');
    
    // Create form_templates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS form_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        provider VARCHAR(100) DEFAULT 'JotForm',
        form_url TEXT,
        embed_code TEXT,
        external_form_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
      )
    `);

    // Create index for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_form_templates_agency_id 
      ON form_templates(agency_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_form_templates_provider 
      ON form_templates(provider)
    `);

    // Update trigger for updated_date
    await client.query(`
      CREATE OR REPLACE FUNCTION update_form_templates_updated_date()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_date = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_form_templates_updated_date ON form_templates;
      CREATE TRIGGER update_form_templates_updated_date
        BEFORE UPDATE ON form_templates
        FOR EACH ROW
        EXECUTE FUNCTION update_form_templates_updated_date();
    `);

    await client.query('COMMIT');
    console.log('✅ Form templates table created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating form templates table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createFormTemplatesTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { createFormTemplatesTable };