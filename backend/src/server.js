import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { authenticateToken, errorHandler, requestLogger, corsHandler } from './middleware/auth.js';

// Import route handlers
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import agencyRoutes from './routes/agencies.js';
import leadRoutes from './routes/leads.js';
import patientRoutes from './routes/patients.js';
import caregiverRoutes from './routes/caregivers.js';
import documentRoutes from './routes/documents.js';
import signatureRoutes from './routes/signatures.js';
import appointmentRoutes from './routes/appointments.js';
import configurationRoutes from './routes/configurations.js';
import taskRoutes from './routes/tasks.js';
import boldSignRoutes from './routes/boldsign.js';
import formTemplateRoutes from './routes/form-templates.js';
import integrationRoutes from './routes/integrations.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://onecaredesk.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(corsHandler);
app.use(requestLogger);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'PostgreSQL',
    auth: 'Kinde OAuth',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agencies', authenticateToken, agencyRoutes);
app.use('/api/leads', authenticateToken, leadRoutes);
app.use('/api/patients', authenticateToken, patientRoutes);
app.use('/api/caregivers', authenticateToken, caregiverRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);
app.use('/api/signatures', authenticateToken, signatureRoutes);
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/configurations', authenticateToken, configurationRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/boldsign', authenticateToken, boldSignRoutes);
app.use('/api/form-templates', authenticateToken, formTemplateRoutes);
app.use('/api/integrations', authenticateToken, integrationRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users',
      'GET /api/agencies',
      'GET /api/leads',
      'GET /api/patients',
      'GET /api/caregivers',
      'GET /api/documents',
      'GET /api/signatures',
      'GET /api/appointments',
      'GET /api/configurations',
      'GET /api/tasks'
    ]
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 API docs available at http://localhost:${PORT}/api/health`);
      console.log(`🔐 Authentication: Kinde OAuth`);
      console.log(`🗄️  Database: PostgreSQL`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
