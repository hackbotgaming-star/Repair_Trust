const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  performedBy: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['administrator', 'engineer', 'field_worker', 'citizen', 'system'],
    default: 'system',
    index: true
  },
  entityType: {
    type: String,
    enum: ['Asset', 'Complaint', 'WorkOrder', 'EvidenceVideo', 'Inspection', 'Investigation', 'User', 'System', 'ExportReport', 'SystemConfig'],
    required: true,
    index: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
