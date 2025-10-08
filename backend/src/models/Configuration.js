import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';

class Configuration extends BaseModel {
  constructor() {
    super('configurations');
  }

  // Get configuration by key
  async findByKey(key) {
    try {
      const records = await this.findAll({ key });
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error(`Error finding configuration by key ${key}:`, error);
      throw error;
    }
  }
  
  // Get multiple configurations by keys  
  async findByKeys(keys) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE key = ANY($1)`,
        [keys]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding configurations by keys:', error);
      throw error;
    }
  }

  // Update or create configuration
  async upsert(key, value, description = null) {
    try {
      const result = await pool.query(
        `INSERT INTO ${this.tableName} (key, value, description, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET 
           value = $2, 
           description = COALESCE($3, ${this.tableName}.description),
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [key, value, description]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Error upserting configuration ${key}:`, error);
      throw error;
    }
  }
}

export default Configuration;