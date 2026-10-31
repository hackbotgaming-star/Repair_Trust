const express = require('express');
const router = express.Router();
const Investigation = require('../models/Investigation');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { analyzeAssetRootCause } = require('../services/evidenceGapEngine');

// List investigations
router.get('/', async (req, res) => {
  try {
    const { status, assetId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assetId) query.assetId = assetId.toUpperCase();

    const investigations = await Investigation.find(query).sort({ updatedAt: -1 });
    return res.json({ success: true, data: investigations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get or trigger investigation for specific asset
router.get('/:assetId', async (req, res) => {
  try {
    const targetAssetId = req.params.assetId.toUpperCase();
    let investigation = await Investigation.findOne({ assetId: targetAssetId });

    if (!investigation) {
      // Generate dynamically from live data
      const analysis = await analyzeAssetRootCause(targetAssetId);
      const count = await Investigation.countDocuments();
      const nextId = `INV-2026-${String(count + 101).padStart(4, '0')}`;

      investigation = new Investigation({
        investigationId: nextId,
        assetId: targetAssetId,
        triggerReason: 'Repeat overflow complaints within 60-day observation window',
        status: 'Active Investigation',
        hypotheses: analysis.hypotheses,
        recommendedNextInspection: analysis.recommendedNextInspection,
        repeatFailureRiskScore: analysis.repeatFailureRiskScore,
        aiConfidence: analysis.aiConfidence
      });
      await investigation.save();
    }

    return res.json({ success: true, data: investigation });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Engineer add conclusion & resolve investigation
router.post('/:assetId/resolve', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const targetAssetId = req.params.assetId.toUpperCase();
    const { conclusion, actionTaken, status } = req.body;

    const investigation = await Investigation.findOneAndUpdate(
      { assetId: targetAssetId },
      {
        $set: {
          status: status || 'Resolved with Root Cause',
          engineerFeedback: {
            conclusion,
            actionTaken: actionTaken || 'Downstream culvert unblocked; gradient verified',
            reviewedBy: req.user.name || req.user.email,
            reviewedAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    // If resolved, update asset status and clear repeatFailureFlag
    await Asset.findOneAndUpdate(
      { assetId: targetAssetId },
      { 
        $set: { 
          status: 'Active', 
          repeatFailureFlag: false,
          riskLevel: 'LOW',
          recommendedAction: 'Regular scheduled maintenance'
        } 
      }
    );

    await AuditLog.create({
      action: 'INVESTIGATION_RESOLVED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'Investigation',
      entityId: investigation.investigationId || targetAssetId,
      details: { conclusion, actionTaken }
    });

    return res.json({ success: true, data: investigation });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
