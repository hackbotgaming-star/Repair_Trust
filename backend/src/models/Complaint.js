const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
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
  category: {
    type: String,
    enum: [
      'Overflow / Waterlogging',
      'Debris / Silt Accumulation',
      'Foul Odor / Stagnation',
      'Structural Crack / Collapse',
      'Grate Missing / Damaged',
      'Pothole / Damaged Road',
      'Broken Footpath',
      'Manhole Damaged / Open',
      'Garbage Blockage',
      'Broken Streetlights',
      'Water Pipeline Leak',
      'Damaged Culvert / Grate',
      'Other Infrastructure Problem'
    ],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  reporterDetails: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, default: 'Citizen Reporter' },
    phone: { type: String, default: '' },
    email: { type: String, default: '', index: true },
    isAnonymous: { type: Boolean, default: false }
  },
  // Precise location (restricted for authorized staff and verification)
  location: {
    street: { type: String, required: true },
    ward: { type: String, required: true, index: true },
    landmark: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  // Generalized public-safe coordinates (privacy protection against exact home localization)
  publicLocation: {
    generalizedStreet: { type: String },
    ward: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true
  },
  // Full transparent state machine (Section 6)
  status: {
    type: String,
    enum: [
      'SUBMITTED',
      'EVIDENCE_SCREENING',
      'UNDER_REVIEW',
      'ACCEPTED',
      'ASSIGNED',
      'INSPECTION_REQUIRED',
      'INSPECTION_SCHEDULED',
      'WORK_IN_PROGRESS',
      'REPAIR_REPORTED_COMPLETE',
      'COMPLETED_AWAITING_VERIFICATION',
      'AWAITING_VERIFICATION',
      'VERIFIED_RESOLVED',
      'NEEDS_MORE_INFORMATION',
      'EVIDENCE_REVIEW_REQUIRED',
      'DISPUTED',
      'REOPENED',
      'REJECTED_WITH_REASON',
      'CLOSED_AFTER_REVIEW',
      'UNVERIFIED_CLOSURE',
      // Legacy mappings for backwards compatibility:
      'Submitted',
      'Reviewed',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed'
    ],
    default: 'SUBMITTED',
    index: true
  },
  rejectionReason: {
    type: String,
    default: null
  },
  photos: [String],
  evidenceIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence'
  }],
  assignedDepartment: {
    type: String,
    default: 'Zone 4 Stormwater Maintenance Division'
  },
  linkedWorkOrderId: {
    type: String,
    default: null,
    index: true
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateOf: {
    type: String,
    default: null
  },
  publicStatusUpdate: {
    type: String,
    default: 'Your complaint has been registered with the Municipal Infrastructure Registry.'
  },
  // Citizen dispute history
  disputes: [{
    disputeId: String,
    reason: String,
    evidencePhotos: [String],
    submittedBy: String,
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['PENDING', 'ACCEPTED_FOR_REOPENING', 'DISMISSED'], default: 'PENDING' },
    reviewerNotes: String
  }],
  // Post-repair citizen feedback (Section 3E)
  citizenFeedback: [{
    outcome: {
      type: String,
      enum: ['Issue resolved', 'Issue partially resolved', 'Issue still exists', 'Issue returned after rain or normal usage']
    },
    notes: String,
    photos: [String],
    submittedAt: { type: Date, default: Date.now }
  }],
  // Official closure verification package
  closureVerification: {
    verifiedBy: String,
    verifiedAt: Date,
    decision: { type: String, enum: ['VERIFIED_RESOLVED', 'UNVERIFIED', 'RETURNED'] },
    notes: String,
    beforePhotos: [String],
    afterPhotos: [String],
    videoProofId: String
  },
  observationDate: {
    type: Date,
    default: Date.now
  },
  recurrenceOf: {
    type: String,
    default: null,
    index: true
  },
  followUpComplaintIds: [{
    type: String
  }],
  isDemo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Helper to sanitize public view (strips citizen identity and exact private house coordinate)
complaintSchema.methods.toPublicView = function () {
  const doc = this.toObject();
  delete doc.reporterDetails;
  // If public location is set, override exact coords with generalized coords
  if (doc.publicLocation && doc.publicLocation.coordinates) {
    doc.location.coordinates = doc.publicLocation.coordinates;
  }
  return doc;
};

module.exports = mongoose.model('Complaint', complaintSchema);
