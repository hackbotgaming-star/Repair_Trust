const mongoose = require('mongoose');

const evidenceItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['photo', 'document', 'note'], default: 'photo' },
  caption: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  sha256Hash: { type: String },
  screeningStatus: { type: String, default: 'No issue detected' },
  fileSize: { type: Number },
  dimensions: { width: Number, height: Number },
  uploadedBy: { type: String }
}, { _id: true });

const workOrderSchema = new mongoose.Schema({
  workOrderId: {
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
  linkedComplaintIds: [{
    type: String
  }],
  problemDescription: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedWorkerName: {
    type: String,
    default: 'Unassigned'
  },
  assignedTeam: {
    type: String,
    default: 'Zone 4 Field Maintenance Squad B'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
    index: true
  },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  repairType: {
    type: String,
    enum: [
      'Drain De-silting & Cleaning',
      'Downstream Obstruction Removal',
      'Structural Crack Patching',
      'Culvert Flume Clearing',
      'Cover Slab / Grate Replacement',
      'Preventative Inspection'
    ],
    default: 'Drain De-silting & Cleaning'
  },
  // Evidence requirements checklist
  requiredEvidenceChecklist: {
    beforePhotoRequired: { type: Boolean, default: true },
    duringPhotoRequired: { type: Boolean, default: true },
    afterPhotoRequired: { type: Boolean, default: true },
    videoProofRequired: { type: Boolean, default: true },
    completionNoteRequired: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: [
      'Created',
      'Assigned',
      'In Progress',
      'Paused',
      'On Hold',
      'Submitted for Review',
      'Approved',
      'Returned for More Evidence',
      'Closed',
      'Reopened'
    ],
    default: 'Created',
    index: true
  },
  pauseReason: {
    type: String,
    default: ''
  },
  checkIns: [{
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    workerName: { type: String },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['check-in', 'check-out'], default: 'check-in' },
    coordinates: { lat: Number, lng: Number },
    distanceMeters: { type: Number },
    isManualEntry: { type: Boolean, default: false },
    manualReason: { type: String, default: '' },
    notes: { type: String, default: '' }
  }],
  revisions: [{
    revisionNumber: { type: Number },
    submittedAt: { type: Date, default: Date.now },
    notes: { type: String },
    evidenceAddedCount: { type: Number, default: 0 }
  }],
  closureAuditorStatus: {
    type: String,
    enum: ['Complete', 'Incomplete', 'Under Review', 'Unverified', 'Approved', 'Reopened'],
    default: 'Incomplete',
    index: true
  },
  closureAuditorFlags: [{
    code: String,
    rule: String,
    message: String,
    severity: { type: String, enum: ['warning', 'error', 'info'], default: 'warning' },
    checkedAt: { type: Date, default: Date.now }
  }],
  beforeEvidence: [evidenceItemSchema],
  duringEvidence: [evidenceItemSchema],
  afterEvidence: [evidenceItemSchema],
  videoEvidence: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EvidenceVideo'
  }],
  completionNotes: {
    type: String,
    default: ''
  },
  materialsUsed: [{
    item: { type: String },
    quantity: { type: String }
  }],
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  engineerDecision: {
    type: String,
    enum: ['Approved', 'Returned', 'Rejected', 'Pending Review', 'Unverified', 'Reopened'],
    default: 'Pending Review'
  },
  engineerComments: {
    type: String,
    default: ''
  },
  auditLog: [{
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    role: { type: String, default: 'system' },
    note: { type: String, default: '' },
    previousStatus: { type: String },
    newStatus: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  isDemo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
