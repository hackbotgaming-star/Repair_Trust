const mongoose = require('mongoose');

const hypothesisSchema = new mongoose.Schema({
  cause: {
    type: String,
    enum: [
      'Repeated debris blockage',
      'Downstream obstruction',
      'Insufficient drainage capacity',
      'Structural damage',
      'Rainfall-related overflow',
      'Unknown cause due to insufficient evidence'
    ],
    required: true
  },
  supportingEvidence: [String],
  contradictingEvidence: [String],
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  evidenceCitationRecords: [String]
}, { _id: false });

const investigationSchema = new mongoose.Schema({
  investigationId: {
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
  triggerReason: {
    type: String,
    default: 'Repeat overflow complaints within 60-day observation window following cleaning work order'
  },
  status: {
    type: String,
    enum: ['Active Investigation', 'Pending Physical Inspection', 'Resolved with Root Cause', 'Closed'],
    default: 'Active Investigation',
    index: true
  },
  hypotheses: [hypothesisSchema],
  recommendedNextInspection: {
    suggestedAction: { type: String, required: true },
    missingEvidence: { type: String, required: true },
    hypothesesDistinguished: [String],
    expectedBenefit: { type: String, required: true },
    priority: { type: String, enum: ['Urgent', 'High', 'Medium', 'Low'], default: 'High' },
    status: { type: String, enum: ['Pending', 'Scheduled', 'Completed'], default: 'Pending' },
    recommendedAt: { type: Date, default: Date.now }
  },
  repeatFailureRiskScore: {
    type: Number,
    default: 78.5
  },
  aiConfidence: {
    type: Number,
    default: 82.0
  },
  engineerFeedback: {
    conclusion: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date },
    actionTaken: { type: String, default: '' }
  },
  isDemo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Investigation', investigationSchema);
