const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['storm-water drain', 'culvert', 'road'],
    default: 'storm-water drain',
    index: true
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance Required', 'Under Investigation', 'Decommissioned'],
    default: 'Active',
    index: true
  },
  location: {
    street: { type: String, required: true },
    ward: { type: String, required: true, index: true },
    municipality: { type: String, default: 'Metropolitan Municipal Corporation' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  dimensions: {
    lengthMeters: { type: Number, default: 50 },
    depthMeters: { type: Number, default: 1.5 },
    widthMeters: { type: Number, default: 1.2 },
    diameterMm: { type: Number, default: 900 },
    material: { type: String, default: 'Reinforced Concrete / Stone Masonry' }
  },
  installationYear: {
    type: Number,
    default: 2018
  },
  lastInspectedAt: {
    type: Date,
    default: Date.now
  },
  debrisSeverityIndex: {
    type: Number,
    min: 1.0,
    max: 5.0,
    default: 2.0
  },
  capacityRatio: {
    type: Number,
    min: 0.1,
    max: 2.0,
    default: 0.85
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH'],
    default: 'LOW',
    index: true
  },
  riskScore: {
    type: Number,
    default: 15.0
  },
  repeatFailureFlag: {
    type: Boolean,
    default: false,
    index: true
  },
  repeatFailureCount: {
    type: Number,
    default: 0
  },
  downstreamAssetId: {
    type: String,
    default: null
  },
  recommendedAction: {
    type: String,
    default: 'Routine cyclic monitoring'
  },
  tags: [String],
  isDemo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);
