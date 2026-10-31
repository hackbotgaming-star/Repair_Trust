require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seeder');
const Asset = require('./models/Asset');

// Import routes (standard & v1)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const workOrderRoutes = require('./routes/workOrderRoutes');
const videoRoutes = require('./routes/videoRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const investigationRoutes = require('./routes/investigationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const auditRoutes = require('./routes/auditRoutes');
const demoRoutes = require('./routes/demoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Versioned v1 routes
const complaintsV1 = require('./routes/v1/complaintsV1');
const evidenceV1 = require('./routes/v1/evidenceV1');
const mapV1 = require('./routes/v1/mapV1');
const notificationsV1 = require('./routes/v1/notificationsV1');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiters for sensitive actions
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});

const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Submission rate limit reached. Please wait before creating more complaints.' }
});

// Static uploads serving with range request support for video & photos
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.set('Accept-Ranges', 'bytes');
  }
}));

// v1 Versioned API Routes (Section 12)
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/complaints', complaintsV1);
app.use('/api/v1/evidence', evidenceV1);
app.use('/api/v1/map', mapV1);
app.use('/api/v1/notifications', notificationsV1);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/work-orders', workOrderRoutes);
app.use('/api/v1/inspections', inspectionRoutes);
app.use('/api/v1/investigations', investigationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);

// Base /api endpoints for backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/demo', demoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'RepairTrust Municipal Decision Support Platform',
    version: '2.1.0',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'RepairTrust v1 API',
    timestamp: new Date()
  });
});

// Serve Frontend Static Build in Production / Single-Service Deployment
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Start Server and Auto-Seed if empty
const startServer = async () => {
  try {
    await connectDB();
    
    const assetCount = await Asset.countDocuments();
    if (assetCount === 0) {
      console.log('[Startup] Database is uninitialized. Running initial seed...');
      await seedDatabase();
    } else {
      console.log(`[Startup] Database already contains ${assetCount} assets. Ready.`);
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  RepairTrust Backend running on port ${PORT}`);
      console.log(`  v1 API: http://localhost:${PORT}/api/v1/health`);
      console.log(`  Upload Storage: ${uploadsPath}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('[Startup] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
