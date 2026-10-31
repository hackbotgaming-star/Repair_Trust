const express = require('express');
const router = express.Router();
const Inspection = require('../models/Inspection');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// List Inspections
router.get('/', async (req, res) => {
  try {
    const { assetId, inspectionType, page = 1, limit = 25 } = req.query;
    const query = {};

    if (assetId) query.assetId = assetId.toUpperCase();
    if (inspectionType) query.inspectionType = inspectionType;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [inspections, total] = await Promise.all([
      Inspection.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit, 10)),
      Inspection.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: inspections,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create Inspection (Field Worker / Engineer / Admin)
router.post('/', authenticate, authorizeRoles('administrator', 'engineer', 'field_worker'), async (req, res) => {
  try {
    const count = await Inspection.countDocuments();
    const nextId = `INS-2026-${String(count + 101).padStart(4, '0')}`;

    const {
      assetId,
      workOrderId,
      inspectionType,
      findings,
      photos,
      recommendation,
      location,
      materialsLogged
    } = req.body;

    const inspection = new Inspection({
      inspectionId: nextId,
      assetId: assetId.toUpperCase(),
      workOrderId: workOrderId || '',
      inspectorName: req.user.name || 'Municipal Field Worker',
      inspectorId: req.user._id,
      inspectionType: inspectionType || (req.user.role === 'field_worker' ? 'Routine Maintenance Check' : 'Downstream CCTV / Camera Probe'),
      date: new Date(),
      location: location || { coordinates: null, isManualEntry: false },
      materialsLogged: materialsLogged || [],
      findings: findings || {
        debrisLevel: 'Moderate',
        structuralIntegrity: 'Sound',
        downstreamFlowClear: true,
        siltDepthCm: 15,
        waterVelocityMps: 0.8,
        notes: 'Inspection performed on site.'
      },
      photos: photos || [],
      recommendation: recommendation || { actionRequired: false, urgency: 'Low' }
    });

    await inspection.save();

    // Update asset lastInspectedAt
    await Asset.findOneAndUpdate(
      { assetId: assetId.toUpperCase() },
      { $set: { lastInspectedAt: new Date() } }
    );

    await AuditLog.create({
      action: 'INSPECTION_CONDUCTED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'Inspection',
      entityId: inspection.inspectionId,
      details: { assetId: inspection.assetId, type: inspection.inspectionType }
    });

    return res.status(201).json({ success: true, data: inspection });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
