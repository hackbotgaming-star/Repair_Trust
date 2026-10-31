const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  recipientEmail: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
  },
  complaintId: {
    type: String,
    index: true
  },
  workOrderId: {
    type: String,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'STATUS_UPDATE',
      'EVIDENCE_REVIEW',
      'INSPECTION_SCHEDULED',
      'WORK_UPDATE',
      'WORK_ORDER_ASSIGNED',
      'WEATHER_ALERT',
      'DISPUTE_UPDATE',
      'REOPEN_CONFIRMED',
      'REPEAT_FAILURE_TRIGGER',
      'SYSTEM'
    ],
    default: 'STATUS_UPDATE'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
