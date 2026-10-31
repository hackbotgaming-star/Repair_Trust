const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  inspectionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  assetId: {
    type: String,
    required: true,
    index: true
  },
  inspectorName: {
    type: String,
    default: 'Senior Drainage Inspector'
  },
  inspectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inspectionType: {
    type: String,
    enum: [
      'Routine Maintenance Check',
      'Post-Repair Verification',
      'Downstream CCTV / Camera Probe',
      'Hydraulic Capacity Audit',
      'Emergency Monsoon Assessment'
    ],
    default: 'Routine Maintenance Check'
  },
  date: {
    type: Date,
    default: Date.now
  },
  workOrderId: {
    type: String,
    index: true
  },
  location: {
    coordinates: { lat: Number, lng: Number },
    isManualEntry: { type: Boolean, default: false },
    street: { type: String, default: '' },
    accuracyMeters: { type: Number }
  },
  findings: {
    debrisLevel: { type: String, enum: ['Clean', 'Light', 'Moderate', 'Heavy / Choked'], default: 'Moderate' },
    structuralIntegrity: { type: String, enum: ['Sound', 'Minor Spalling', 'Severe Crack', 'Collapsed Section'], default: 'Sound' },
    downstreamFlowClear: { type: Boolean, default: true },
    siltDepthCm: { type: Number, default: 12 },
    waterVelocityMps: { type: Number, default: 0.8 },
    notes: { type: String, default: '' }
  },
  materialsLogged: [{
    item: { type: String },
    quantity: { type: String }
  }],
  photos: [String],
  recommendation: {
    actionRequired: { type: Boolean, default: false },
    suggestedRepairType: { type: String },
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' }
  },
  isDemo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inspection', inspectionSchema);
