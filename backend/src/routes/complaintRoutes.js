const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// List complaints (Staff view: filters by status, category, ward, assetId)
router.get('/', async (req, res) => {
  try {
    const { status, category, assetId, ward, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (assetId) query.assetId = assetId.toUpperCase();
    if (ward) query['location.ward'] = ward;
    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.street': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [complaints, total] = await Promise.all([
      Complaint.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      Complaint.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: complaints,
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

// Citizen Public Tracking (no sensitive internal worker details exposed)
router.get('/track/:complaintId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ 
      complaintId: req.params.complaintId.toUpperCase() 
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint ID not found in municipal registry.' });
    }

    return res.json({
      success: true,
      data: {
        complaintId: complaint.complaintId,
        category: complaint.category,
        location: {
          street: complaint.location.street,
          ward: complaint.location.ward
        },
        severity: complaint.severity,
        status: complaint.status,
        submittedAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        publicStatusUpdate: complaint.publicStatusUpdate,
        assignedDepartment: complaint.assignedDepartment,
        isResolved: complaint.status === 'Resolved' || complaint.status === 'Closed'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Single complaint full view
router.get('/:complaintId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ 
      complaintId: req.params.complaintId.toUpperCase() 
    });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    return res.json({ success: true, data: complaint });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Citizen Submit Complaint
router.post('/', async (req, res) => {
  try {
    const count = await Complaint.countDocuments();
    const nextId = `CMP-2026-${String(count + 101).padStart(4, '0')}`;

    const {
      assetId,
      category,
      description,
      reporterDetails,
      location,
      severity,
      photos
    } = req.body;

    let targetAssetId = assetId ? assetId.toUpperCase() : 'DR-001';

    // Verify or find nearest asset if not specified
    if (!assetId && location && location.lat) {
      const nearest = await Asset.findOne();
      if (nearest) targetAssetId = nearest.assetId;
    }

    const complaint = new Complaint({
      complaintId: nextId,
      assetId: targetAssetId,
      category: category || 'Overflow / Waterlogging',
      description,
      reporterDetails: reporterDetails || { name: 'Citizen Reporter', isAnonymous: false },
      location: location || { street: 'Main Arterial Road', ward: 'Ward 4', coordinates: { lat: 12.9716, lng: 77.5946 } },
      severity: severity || 'Medium',
      photos: photos || []
    });

    await complaint.save();

    await AuditLog.create({
      action: 'COMPLAINT_SUBMITTED',
      performedBy: (reporterDetails && reporterDetails.name) || 'Citizen',
      userRole: 'citizen',
      entityType: 'Complaint',
      entityId: complaint.complaintId,
      details: { assetId: targetAssetId, category: complaint.category }
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and recorded in Municipal Registry.',
      data: complaint
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Update status / link to Work Order (Engineer / Admin)
router.patch('/:complaintId/status', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const { status, publicStatusUpdate, assignedDepartment, linkedWorkOrderId } = req.body;
    
    const update = {};
    if (status) update.status = status;
    if (publicStatusUpdate) update.publicStatusUpdate = publicStatusUpdate;
    if (assignedDepartment) update.assignedDepartment = assignedDepartment;
    if (linkedWorkOrderId) update.linkedWorkOrderId = linkedWorkOrderId;

    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.complaintId.toUpperCase() },
      { $set: update },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await AuditLog.create({
      action: 'COMPLAINT_STATUS_UPDATED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'Complaint',
      entityId: complaint.complaintId,
      details: update
    });

    return res.json({ success: true, data: complaint });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Mark as Duplicate with explainable link
router.post('/:complaintId/duplicate', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const { duplicateOf, reason } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.complaintId.toUpperCase() },
      { 
        $set: { 
          isDuplicate: true, 
          duplicateOf: duplicateOf.toUpperCase(),
          status: 'Resolved',
          publicStatusUpdate: `Merged with existing reported incident ${duplicateOf.toUpperCase()}: ${reason || 'Duplicate report for identical location'}.`
        } 
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    return res.json({ success: true, data: complaint });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
