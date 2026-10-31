const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: true,
    unique: true,
    default: 'MUNICIPAL_GLOBAL_CONFIG'
  },
  
  // 3. Department and Ward Management
  departments: [{
    departmentId: { type: String, required: true },
    name: { type: String, required: true },
    headOfDepartment: { type: String, default: 'Chief Engineer' },
    contactEmail: { type: String },
    phone: { type: String },
    serviceWards: [{ type: String }],
    activePersonnelCount: { type: Number, default: 12 }
  }],
  wards: [{
    wardNumber: { type: String, required: true },
    name: { type: String, required: true },
    zone: { type: String, default: 'Zone 4' },
    population: { type: Number, default: 85000 },
    riskTier: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'], default: 'Moderate' },
    primaryInspector: { type: String, default: 'Vikram Sengupta, P.E.' }
  }],

  // 4. Asset Categories and Configuration
  assetCategories: [{
    categoryId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    defaultMaintenanceIntervalDays: { type: Number, default: 90 },
    unitOfMeasure: { type: String, default: 'Meters' },
    inspectionTypeRequired: { type: String, default: 'Physical Site & Silt Measurement' }
  }],

  // 5. Evidence Verification Rules
  evidenceVerificationRules: {
    repairTypes: [{
      repairType: { type: String, required: true },
      beforePhotoRequired: { type: Boolean, default: true },
      duringPhotoRequired: { type: Boolean, default: true },
      afterPhotoRequired: { type: Boolean, default: true },
      videoProofRequired: { type: Boolean, default: true },
      minPhotos: { type: Number, default: 3 }
    }],
    maxFileSizeMb: { type: Number, default: 25 },
    allowedFormats: [{ type: String, default: ['image/jpeg', 'image/png', 'video/webm', 'video/mp4'] }],
    retentionDays: { type: Number, default: 180 },
    reviewThresholds: {
      autoFlagRepeatIntervalDays: { type: Number, default: 60 },
      minWorkerNotesLength: { type: Number, default: 20 },
      strictMonsoonEnforcement: { type: Boolean, default: true }
    }
  },

  // 6. Complaint and Work Order Settings
  complaintWorkOrderSettings: {
    categories: [{ type: String }],
    prioritySlaHours: {
      Low: { type: Number, default: 168 },      // 7 days
      Medium: { type: Number, default: 72 },    // 3 days
      High: { type: Number, default: 24 },      // 24 hours
      Urgent: { type: Number, default: 8 }       // 8 hours
    },
    autoConsolidateProximityMeters: { type: Number, default: 30 },
    allowedStatusTransitions: [{ type: String }],
    publicReportingEnabled: { type: Boolean, default: true }, // CANNOT be disabled to hide complaints
    requireReasonOnRejection: { type: Boolean, default: true }
  },

  // 7. AI Model and Detection Settings
  aiModelSettings: {
    fraudDetectorVersion: { type: String, default: 'v2.4-phash-crypto' },
    perceptualHashThreshold: { type: Number, default: 12 },
    minResolution: { type: String, default: '640x480' },
    rootCauseConfidenceCutoff: { type: Number, default: 75.0 },
    mlServiceUrl: { type: String, default: 'http://127.0.0.1:8000' },
    isOperational: { type: Boolean, default: true },
    lastEvaluatedAt: { type: Date, default: Date.now },
    syntheticDataMode: { type: Boolean, default: true },
    validationMetrics: {
      precision: { type: Number, default: 0.94 },
      recall: { type: Number, default: 0.91 },
      f1Score: { type: Number, default: 0.925 },
      evaluatedRecordsCount: { type: Number, default: 1240 }
    },
    knownLimitations: { type: String, default: 'High turbidity water reflections can introduce false edge positives in raw silt boundary calculations.' }
  },

  // 11. Public Transparency Settings
  transparencySettings: {
    maskCitizenNames: { type: Boolean, default: true },
    showExactCoordinates: { type: Boolean, default: true },
    allowPublicDisputes: { type: Boolean, default: true },
    hidePersonalPhone: { type: Boolean, default: true },
    publicDashboardCacheMins: { type: Number, default: 5 },
    showClosureAuditorEvaluationPublicly: { type: Boolean, default: true }
  },

  // 12. Security and Privacy Settings
  securityPrivacySettings: {
    sessionTimeoutMins: { type: Number, default: 60 },
    maxFailedLoginAttempts: { type: Number, default: 5 },
    lockoutDurationMins: { type: Number, default: 15 },
    encryptionAtRest: { type: Boolean, default: true },
    auditTrailRetentionYears: { type: Number, default: 7 },
    ipRateLimitPerMinute: { type: Number, default: 120 }
  },

  // 13. Backup and Data Retention Settings
  backupRetentionSettings: {
    automatedBackupIntervalHours: { type: Number, default: 24 },
    storageProvider: { type: String, default: 'Local Secure Encrypted Store' },
    lastBackupTimestamp: { type: Date, default: Date.now },
    lastBackupSizeBytes: { type: Number, default: 14859000 },
    retentionPolicyDays: { type: Number, default: 365 },
    backupLocation: { type: String, default: '/var/backups/repairtrust' },
    activeSnapshotsCount: { type: Number, default: 14 }
  },

  lastModifiedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
