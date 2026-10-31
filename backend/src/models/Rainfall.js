const mongoose = require('mongoose');

const rainfallSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    index: true
  },
  stationName: {
    type: String,
    default: 'Central Ward Hydro-Met Observatory'
  },
  ward: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  rainfallMm: {
    type: Number,
    required: true
  },
  intensityCategory: {
    type: String,
    enum: ['None / Trace', 'Light (<15mm)', 'Moderate (15-40mm)', 'Heavy (40-80mm)', 'Extreme (>80mm)'],
    default: 'Moderate (15-40mm)'
  },
  stormEventId: {
    type: String
  },
  isDemo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rainfall', rainfallSchema);
