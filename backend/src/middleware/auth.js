import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// JWT Authentication middleware with Kinde support
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  // For development: allow dummy-token to pass through
  if (token === 'dummy-token' && process.env.NODE_ENV === 'development') {
    req.user = {
      id: 'dev-user',
      email: 'dev@example.com',
      role: 'admin'
    };
    return next();
  }

  // Try to verify as JWT token first
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If JWT verification fails, check if it's a Kinde token
      // For now, we'll allow Kinde tokens to pass through in development
      if (process.env.NODE_ENV === 'development' && token.startsWith('ey')) {
        // Looks like a JWT token (base64 encoded), assume it's a valid Kinde token
        req.user = {
          id: 'kinde-user',
          email: 'kinde@example.com',
          role: 'user'
        };
        return next();
      }
      
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token is not valid or has expired'
      });
    }
    req.user = user;
    next();
  });
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Rate limiting middleware
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Default rate limit for API
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes

// Stricter rate limit for auth endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes

// CORS handler
export const corsHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
};

// Request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      console.error('❌ Request failed:', logData);
    } else {
      console.log('✅ Request completed:', logData);
    }
  });
  
  next();
};

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Validate request body middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message,
        details: error.details
      });
    }
    next();
  };
};
