const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  evidenceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  complaintId: {
    type: String,
    required: true,
    index: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  storagePath: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  sha256Hash: {
    type: String,
    required: true,
    index: true
  },
  perceptualHash: {
    type: String,
    default: ''
  },
  magicBytesValidated: {
    type: Boolean,
    default: true
  },
  exifStripped: {
    type: Boolean,
    default: true
  },
  privateExif: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Structured screening result (Section 4)
  screeningResult: {
    status: {
      type: String,
      enum: [
        'Pending verification',
        'No issue detected',
        'No obvious issue detected',
        'Suspicious—manual review required',
        'Suspicious — manual review required',
        'Suspicious - manual review required',
        'Duplicate or likely duplicate',
        'Inconclusive',
        'Verification failed because of a technical error'
      ],
      default: 'Pending verification',
      index: true
    },
    signals: [String],
    confidenceScore: {
      type: Number,
      default: 85
    },
    duplicateOfEvidenceId: {
      type: String,
      default: null
    },
    duplicateOfComplaintId: {
      type: String,
      default: null
    },
    detectorVersion: {
      type: String,
      default: 'v2.1-integrity-screening-engine'
    },
    screenedAt: {
      type: Date,
      default: Date.now
    },
    limitationDisclaimer: {
      type: String,
      default: 'Evidence authenticity screening checks cryptographic integrity and perceptual similarity. Metadata and heuristics do not guarantee photographic truth.'
    }
  },
  uploadedBy: {
    type: String,
    default: 'Citizen Reporter'
  },
  uploadedByRole: {
    type: String,
    enum: ['citizen', 'field_worker', 'engineer', 'administrator', 'system'],
    default: 'citizen'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evidence', evidenceSchema);
