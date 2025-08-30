import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { createKindeUser, findKindeUserByEmail } from '../services/kindeManagement.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, status, kinde_id, created_date, updated_date FROM users ORDER BY created_date DESC'
    );
    
    res.json({
      users: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Get user management data (compatible with existing frontend)
router.get('/management-data', async (req, res) => {
  try {
    const { agencyId } = req.query;
    
    // Get users
    let userQuery = `
      SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        status,
        agency_id,
        kinde_id,
        created_date,
        updated_date
      FROM users
    `;
    
    const params = [];
    if (agencyId) {
      userQuery += ' WHERE agency_id = $1';
      params.push(agencyId);
    }
    
    userQuery += ' ORDER BY created_date DESC';
    
    const usersResult = await query(userQuery, params);
    
    // Mock invitations data for now (you can create a separate invitations table later)
    const mockInvitations = [];
    
    res.json({
      success: true,
      data: {
        users: usersResult.rows.map(user => ({
          ...user,
          full_name: `${user.first_name} ${user.last_name}`,
          name: `${user.first_name} ${user.last_name}`
        })),
        invitations: mockInvitations,
        total_users: usersResult.rows.length,
        total_invitations: mockInvitations.length
      }
    });
  } catch (error) {
    console.error('Error fetching user management data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user management data',
      message: error.message
    });
  }
});

// Check if user exists by email
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    const result = await query(
      'SELECT id, email, first_name, last_name, role, kinde_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      res.json({
        exists: true,
        user: result.rows[0]
      });
    } else {
      res.json({
        exists: false,
        user: null
      });
    }
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      error: 'Failed to check email',
      message: error.message
    });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { email, firstName, lastName, role = 'user', agencyId, kindeId } = req.body;

    // Validate input - only email is required
    if (!email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email is required'
      });
    }

    // Provide defaults for names if not provided
    const finalFirstName = firstName || email.split('@')[0] || 'User';
    const finalLastName = lastName || '';

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    let finalKindeId = kindeId;
    
    // If no kindeId provided, try to create user in Kinde (for dashboard-created users)
    if (!kindeId) {
      try {
        console.log('📝 Creating user in Kinde for dashboard user:', email);
        
        // First check if user already exists in Kinde
        const existingKindeUser = await findKindeUserByEmail(email);
        
        if (existingKindeUser) {
          console.log('ℹ️ User already exists in Kinde, using existing ID');
          finalKindeId = existingKindeUser.id;
        } else {
          // Create new user in Kinde
          const kindeUser = await createKindeUser({
            email,
            firstName: finalFirstName,
            lastName: finalLastName
          });
          
          finalKindeId = kindeUser.id;
          console.log('✅ User created in Kinde with ID:', finalKindeId);
        }
      } catch (kindeError) {
        console.error('❌ Failed to create user in Kinde:', kindeError);
        // Continue with local creation but log the error
        // Use a manual kinde_id as fallback
        finalKindeId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('⚠️ Using fallback kinde_id:', finalKindeId);
      }
    }

    // Create user in local database
    const result = await query(
      `INSERT INTO users (email, first_name, last_name, role, status, agency_id, kinde_id, created_date, updated_date)
       VALUES ($1, $2, $3, $4, 'active', $5, $6, NOW(), NOW())
       RETURNING id, email, first_name, last_name, role, status, agency_id, kinde_id, created_date`,
      [email, finalFirstName, finalLastName, role, agencyId, finalKindeId]
    );

    const newUser = result.rows[0];
    
    // Determine if user was created in Kinde or is using fallback ID
    const kindeCreated = finalKindeId && !finalKindeId.startsWith('manual_');
    
    res.status(201).json({
      success: true,
      user: {
        ...newUser,
        full_name: `${newUser.first_name} ${newUser.last_name}`,
        name: `${newUser.first_name} ${newUser.last_name}`
      },
      message: kindeCreated 
        ? 'User created successfully in both local database and Kinde' 
        : 'User created in local database (Kinde creation failed)',
      kindeCreated: kindeCreated
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, status, agencyId } = req.body;

    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, role = $3, status = $4, agency_id = $5, updated_date = NOW()
       WHERE id = $6
       RETURNING id, email, first_name, last_name, role, status, agency_id, kinde_id, updated_date`,
      [firstName, lastName, role, status, agencyId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const updatedUser = result.rows[0];
    
    res.json({
      success: true,
      user: {
        ...updatedUser,
        full_name: `${updatedUser.first_name} ${updatedUser.last_name}`,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, status, kinde_id, created_date, updated_date FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, updated_date = NOW()
       WHERE id = $3
       RETURNING id, email, first_name, last_name, role, status, kinde_id, updated_date`,
      [firstName, lastName, req.user.userId]
    );
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

export default router;
