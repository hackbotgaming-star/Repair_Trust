const express = require('express');
const router = express.Router();
const Complaint = require('../../models/Complaint');
const Asset = require('../../models/Asset');

// GET /api/v1/map/complaints — privacy-safe public map points
router.get('/complaints', async (req, res) => {
  try {
    const { category, status, severity } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const complaints = await Complaint.find(query).select(
      'complaintId assetId category severity status publicLocation location createdAt'
    );

    // Return generalized coordinates to avoid exposing private homes
    const points = complaints.map((c) => ({
      complaintId: c.complaintId,
      assetId: c.assetId,
      category: c.category,
      severity: c.severity,
      status: c.status,
      street: (c.publicLocation && c.publicLocation.generalizedStreet) || c.location.street,
      ward: (c.publicLocation && c.publicLocation.ward) || c.location.ward,
      coordinates: (c.publicLocation && c.publicLocation.coordinates) || c.location.coordinates,
      createdAt: c.createdAt
    }));

    return res.json({ success: true, data: points });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/map/assets — infrastructure assets
router.get('/assets', async (req, res) => {
  try {
    const assets = await Asset.find().select(
      'assetId name type status location riskLevel riskScore repeatFailureFlag repeatFailureCount'
    );
    return res.json({ success: true, data: assets });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
