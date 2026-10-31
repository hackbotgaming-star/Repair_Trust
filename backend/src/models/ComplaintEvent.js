const mongoose = require('mongoose');
const crypto = require('crypto');

const complaintEventSchema = new mongoose.Schema({
  eventId: {
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
  eventType: {
    type: String,
    enum: [
      'COMPLAINT_CREATED',
      'EVIDENCE_UPLOADED',
      'EVIDENCE_SCREENED',
      'STATUS_CHANGED',
      'DEPARTMENT_ASSIGNED',
      'INSPECTION_SCHEDULED',
      'WORK_ORDER_LINKED',
      'REPAIR_SUBMITTED',
      'REPAIR_VERIFIED',
      'REPAIR_RETURNED',
      'REJECTED_WITH_REASON',
      'DISPUTE_FILED',
      'COMPLAINT_REOPENED',
      'CITIZEN_FEEDBACK_RECEIVED',
      'ADMIN_CORRECTION'
    ],
    required: true,
    index: true
  },
  actorId: {
    type: String,
    default: 'system'
  },
  actorName: {
    type: String,
    required: true
  },
  actorRole: {
    type: String,
    enum: ['citizen', 'field_worker', 'engineer', 'administrator', 'system'],
    default: 'system'
  },
  changeSummary: {
    type: String,
    required: true
  },
  previousStatus: {
    type: String
  },
  newStatus: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Chained tamper-evidence
  previousEventHash: {
    type: String,
    default: '0000000000000000000000000000000000000000000000000000000000000000'
  },
  eventHash: {
    type: String,
    required: true,
    index: true
  }
});

/**
 * Computes canonical SHA-256 hash for the event linked to previous event's hash.
 */
complaintEventSchema.statics.computeEventHash = function (payload, prevHash = '0000000000000000000000000000000000000000000000000000000000000000') {
  const canonicalString = JSON.stringify({
    eventId: payload.eventId,
    complaintId: payload.complaintId,
    eventType: payload.eventType,
    actorName: payload.actorName,
    actorRole: payload.actorRole,
    changeSummary: payload.changeSummary,
    previousStatus: payload.previousStatus || '',
    newStatus: payload.newStatus || '',
    timestamp: payload.timestamp instanceof Date ? payload.timestamp.toISOString() : payload.timestamp,
    prevHash
  });

  return crypto.createHash('sha256').update(canonicalString).digest('hex');
};

module.exports = mongoose.model('ComplaintEvent', complaintEventSchema);
