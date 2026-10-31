const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { buildAssetMemoryGraph } = require('../services/memoryGraphService');
const { analyzeAssetRootCause } = require('../services/evidenceGapEngine');
const AuditLog = require('../models/AuditLog');

// List Assets with search, filters, pagination
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      type, 
      status, 
      ward, 
      riskLevel, 
      repeatFailureOnly, 
      page = 1, 
      limit = 25,
      sortBy = 'assetId',
      order = 'asc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { assetId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { 'location.street': { $regex: search, $options: 'i' } },
        { 'location.ward': { $regex: search, $options: 'i' } }
      ];
    }

    if (type) query.type = type;
    if (status) query.status = status;
    if (ward) query['location.ward'] = ward;
    if (riskLevel) query.riskLevel = riskLevel;
    if (repeatFailureOnly === 'true') query.repeatFailureFlag = true;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

    const [assets, total] = await Promise.all([
      Asset.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit, 10)),
      Asset.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: assets,
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

// Single Asset Profile
router.get('/:assetId', async (req, res) => {
  try {
    const asset = await Asset.findOne({ assetId: req.params.assetId.toUpperCase() });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    return res.json({ success: true, data: asset });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create Asset (Admin / Engineer)
router.post('/', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const { assetId, name, location, type } = req.body;
    if (!assetId || !name) {
      return res.status(400).json({ success: false, message: 'Asset ID and Name are required.' });
    }

    // Check duplicate by assetId
    const existingById = await Asset.findOne({ assetId: assetId.toUpperCase() });
    if (existingById) {
      return res.status(409).json({ 
        success: false, 
        message: `Asset ID "${assetId.toUpperCase()}" already exists in the municipal registry.` 
      });
    }

    // Check near-identical duplicate by location street + name in same ward
    if (location && location.street && location.ward) {
      const existingNear = await Asset.findOne({
        'location.ward': location.ward,
        'location.street': { $regex: new RegExp(`^${location.street.trim()}$`, 'i') },
        type
      });
      if (existingNear) {
        return res.status(409).json({
          success: false,
          message: `An infrastructure asset of type "${type}" already exists at "${location.street}" in ${location.ward} (${existingNear.assetId}: ${existingNear.name}). Duplicate creation prevented.`
        });
      }
    }

    const asset = new Asset({
      ...req.body,
      assetId: assetId.toUpperCase()
    });
    await asset.save();

    await AuditLog.create({
      action: 'ASSET_CREATED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'Asset',
      entityId: asset.assetId,
      details: { name: asset.name, type: asset.type, ward: asset.location.ward }
    });

    return res.status(201).json({ success: true, data: asset });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Update Asset
router.put('/:assetId', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { assetId: req.params.assetId.toUpperCase() },
      req.body,
      { new: true, runValidators: true }
    );
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await AuditLog.create({
      action: 'ASSET_UPDATED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'Asset',
      entityId: asset.assetId,
      details: req.body
    });

    return res.json({ success: true, data: asset });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Asset Memory Graph (Timeline & Directed Graph)
router.get('/:assetId/memory-graph', async (req, res) => {
  try {
    const memoryGraph = await buildAssetMemoryGraph(req.params.assetId.toUpperCase());
    return res.json({ success: true, data: memoryGraph });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
});

// AI-Assisted Root Cause & Evidence Gap Analysis
router.get('/:assetId/root-cause', async (req, res) => {
  try {
    const analysis = await analyzeAssetRootCause(req.params.assetId.toUpperCase());
    return res.json({ success: true, data: analysis });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
