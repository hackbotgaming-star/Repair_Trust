const mongoose = require('mongoose');

const evidenceVideoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  workOrderId: {
    type: String,
    required: true,
    index: true
  },
  assetId: {
    type: String,
    required: true,
    index: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedByName: {
    type: String,
    default: 'Field Operator'
  },
  fileUrl: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    default: 'video/mp4'
  },
  durationSeconds: {
    type: Number,
    default: 15
  },
  stage: {
    type: String,
    enum: ['before_cleaning', 'during_operation', 'post_completion_flow', 'combined_walkthrough'],
    required: true
  },
  // Distinct metadata: client vs server verified
  clientProvidedMetadata: {
    clientTimestamp: { type: Date, default: Date.now },
    userAgent: { type: String, default: '' },
    isLiveCameraCapture: { type: Boolean, default: true },
    reportedCoordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  serverVerifiedMetadata: {
    receivedAt: { type: Date, default: Date.now },
    integrityCheckPassed: { type: Boolean, default: true },
    allowedFormat: { type: Boolean, default: true }
  },
  reviewStatus: {
    type: String,
    enum: ['Pending Review', 'Accepted', 'Needs Additional Footage', 'Rejected'],
    default: 'Pending Review',
    index: true
  },
  reviewerComments: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  retentionExpiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180-day retention
  },
  isDemo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EvidenceVideo', evidenceVideoSchema);
