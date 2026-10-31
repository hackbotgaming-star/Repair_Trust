const express = require('express');
const router = express.Router();
const Evidence = require('../../models/Evidence');
const { authenticate } = require('../../middleware/auth');
const { screenEvidenceFile } = require('../../services/evidenceScreeningService');

// Get evidence record
router.get('/:id', async (req, res) => {
  try {
    const evidence = await Evidence.findOne({ evidenceId: req.params.id.toUpperCase() });
    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence record not found' });
    }
    return res.json({ success: true, data: evidence });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger / re-run screening
router.post('/:id/screen', authenticate, async (req, res) => {
  try {
    const evidence = await Evidence.findOne({ evidenceId: req.params.id.toUpperCase() });
    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence record not found' });
    }

    const screening = await screenEvidenceFile({
      filePath: evidence.storagePath,
      originalFilename: evidence.originalFilename,
      mimeType: evidence.mimeType,
      fileSize: evidence.fileSize,
      complaintId: evidence.complaintId
    });

    evidence.screeningResult = {
      status: screening.status,
      signals: screening.signals,
      confidenceScore: screening.confidenceScore,
      duplicateOfEvidenceId: screening.duplicateOfEvidenceId,
      duplicateOfComplaintId: screening.duplicateOfComplaintId,
      screenedAt: new Date()
    };
    await evidence.save();

    return res.json({ success: true, data: evidence });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
