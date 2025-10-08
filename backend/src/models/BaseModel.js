import { pool } from '../config/database.js';

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  async findAll(conditions = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const values = [];
      
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        values.push(...Object.values(conditions));
      }
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error(`Error finding records in ${this.tableName}:`, error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error finding record by ID in ${this.tableName}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, index) => `$${index + 1}`);
      
      const query = `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error(`Error creating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map((col, index) => `${col} = $${index + 2}`);
      
      const query = `
        UPDATE ${this.tableName}
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error deleting record from ${this.tableName}:`, error);
      throw error;
    }
  }

  async count(conditions = {}) {
    try {
      let query = `SELECT COUNT(*) FROM ${this.tableName}`;
      const values = [];
      
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        values.push(...Object.values(conditions));
      }
      
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error counting records in ${this.tableName}:`, error);
      throw error;
    }
  }
}

export default BaseModel;
