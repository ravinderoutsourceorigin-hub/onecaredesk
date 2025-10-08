import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { authRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authRateLimit);

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, username, role = 'user' } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email, password, firstName, and lastName are required'
      });
    }

    // Check if user already exists by email
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (existingUsername.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Username already taken',
          message: 'This username is already in use'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a personal agency for the new user
    let agencyId = null;
    try {
      const agencyName = `${firstName} ${lastName}'s Agency`;
      const agencyResult = await query(
        `INSERT INTO agencies (name, address, phone, email, created_date, updated_date)
         VALUES ($1, '', '', $2, NOW(), NOW())
         RETURNING id`,
        [agencyName, email]
      );
      agencyId = agencyResult.rows[0].id;
      console.log(`✅ Created personal agency: ${agencyName} (${agencyId})`);
    } catch (agencyError) {
      console.error('Warning: Failed to create personal agency:', agencyError);
      // Continue without agency - user can create/join one later
    }

    // Create user with username support
    // kinde_id is NULL for password-based auth users
    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, username, role, status, agency_id, kinde_id, created_date, updated_date)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, NULL, NOW(), NOW())
       RETURNING id, email, first_name, last_name, username, role, status, agency_id, created_date`,
      [email, hashedPassword, firstName, lastName, username || null, role, agencyId]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        role: user.role,
        status: user.status,
        agency_id: user.agency_id,
        createdAt: user.created_date
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message || 'An error occurred during registration'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, identifier } = req.body;
    
    // Support both 'email' and 'identifier' (username or email)
    const loginIdentifier = identifier || email;

    // Validate input
    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Email/username and password are required'
      });
    }

    // Find user by email or username
    const result = await query(
      'SELECT id, email, username, password, first_name, last_name, role, status, agency_id FROM users WHERE email = $1 OR username = $1',
      [loginIdentifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email/username or password is incorrect'
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account inactive',
        message: 'Your account has been deactivated'
      });
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid login method',
        message: 'This account uses OAuth login. Please sign in with Google.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email/username or password is incorrect'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        agency_id: user.agency_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Refresh token is required'
      });
    }

    // Verify current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        email: decoded.email, 
        role: decoded.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: 'Invalid or expired token'
    });
  }
});

// Logout (client-side handles token removal)
router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout successful'
  });
});

export default router;
