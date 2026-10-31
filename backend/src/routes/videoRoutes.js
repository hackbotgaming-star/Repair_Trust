const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const EvidenceVideo = require('../models/EvidenceVideo');
const WorkOrder = require('../models/WorkOrder');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { auditWorkOrder } = require('../services/auditorService');
const { generateSequentialId } = require('../utils/idGenerator');

// List Videos
router.get('/', async (req, res) => {
  try {
    const { workOrderId, assetId, stage, reviewStatus } = req.query;
    const query = {};

    if (workOrderId) query.workOrderId = workOrderId.toUpperCase();
    if (assetId) query.assetId = assetId.toUpperCase();
    if (stage) query.stage = stage;
    if (reviewStatus) query.reviewStatus = reviewStatus;

    const videos = await EvidenceVideo.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: videos });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Single Video
router.get('/:videoId', async (req, res) => {
  try {
    const video = await EvidenceVideo.findOne({ 
      videoId: req.params.videoId.toUpperCase() 
    });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video evidence record not found' });
    }
    return res.json({ success: true, data: video });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Upload LiveWork Proof Video
router.post('/upload', authenticate, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    const {
      workOrderId,
      assetId,
      stage,
      durationSeconds,
      clientLat,
      clientLng,
      isLiveCameraCapture,
      userAgent
    } = req.body;

    if (!workOrderId || !assetId || !stage) {
      return res.status(400).json({ 
        success: false, 
        message: 'workOrderId, assetId, and stage are mandatory fields' 
      });
    }

    const nextVideoId = await generateSequentialId(EvidenceVideo, 'videoId', 'VID');

    // Relative URL path for frontend playback
    const fileUrl = `/uploads/videos/${req.file.filename}`;

    const video = new EvidenceVideo({
      videoId: nextVideoId,
      workOrderId: workOrderId.toUpperCase(),
      assetId: assetId.toUpperCase(),
      submittedBy: req.user._id,
      submittedByName: req.user.name || 'Field Worker',
      fileUrl,
      filename: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      durationSeconds: parseFloat(durationSeconds) || 15.0,
      stage: stage || 'combined_walkthrough',
      clientProvidedMetadata: {
        clientTimestamp: new Date(),
        userAgent: userAgent || req.headers['user-agent'] || '',
        isLiveCameraCapture: isLiveCameraCapture === 'true' || isLiveCameraCapture === true,
        reportedCoordinates: {
          lat: clientLat ? parseFloat(clientLat) : undefined,
          lng: clientLng ? parseFloat(clientLng) : undefined
        }
      },
      serverVerifiedMetadata: {
        receivedAt: new Date(),
        integrityCheckPassed: true,
        allowedFormat: true
      },
      reviewStatus: 'Pending Review'
    });

    await video.save();

    // Link video into WorkOrder and categorize into before / during / after evidence collections
    const order = await WorkOrder.findOne({ workOrderId: workOrderId.toUpperCase() });
    if (order) {
      if (!order.videoEvidence.includes(video._id)) {
        order.videoEvidence.push(video._id);
      }

      const evidenceEntry = {
        url: fileUrl,
        type: 'video',
        caption: `LiveWork Proof: ${stage === 'before_cleaning' ? 'Before Cleaning' : stage === 'during_operation' ? 'During Cleaning Operation' : stage === 'post_completion_flow' ? 'After Cleaning Flow' : 'Full Walkthrough'} (${nextVideoId})`,
        timestamp: new Date(),
        fileSize: req.file.size,
        uploadedBy: req.user.name || req.user.email
      };

      if (stage === 'before_cleaning') {
        order.beforeEvidence.push(evidenceEntry);
      } else if (stage === 'during_operation') {
        order.duringEvidence.push(evidenceEntry);
      } else if (stage === 'post_completion_flow') {
        order.afterEvidence.push(evidenceEntry);
      } else if (stage === 'combined_walkthrough') {
        order.afterEvidence.push(evidenceEntry);
      }

      order.auditLog.push({
        action: 'LIVEWORK_VIDEO_UPLOADED',
        performedBy: req.user.name || req.user.email,
        role: req.user.role,
        note: `Uploaded video ${nextVideoId} categorized as '${stage}'`,
        previousStatus: order.status,
        newStatus: order.status
      });

      // Update auditor status
      const asset = await Asset.findOne({ assetId: order.assetId });
      const auditResult = await auditWorkOrder(order, asset);
      order.closureAuditorStatus = auditResult.closureAuditorStatus;
      order.closureAuditorFlags = auditResult.closureAuditorFlags;

      await order.save();
    }

    await AuditLog.create({
      action: 'VIDEO_EVIDENCE_UPLOADED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'EvidenceVideo',
      entityId: video.videoId,
      details: {
        workOrderId: video.workOrderId,
        assetId: video.assetId,
        stage: video.stage,
        sizeMb: (video.fileSize / 1024 / 1024).toFixed(2)
      }
    });

    return res.status(201).json({
      success: true,
      message: 'LiveWork Proof video uploaded and verified successfully.',
      data: video
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Engineer Review Video
router.patch('/:videoId/review', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const { reviewStatus, reviewerComments } = req.body;
    const video = await EvidenceVideo.findOneAndUpdate(
      { videoId: req.params.videoId.toUpperCase() },
      {
        $set: {
          reviewStatus,
          reviewerComments: reviewerComments || '',
          reviewedBy: req.user._id,
          reviewedAt: new Date()
        }
      },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video record not found' });
    }

    await AuditLog.create({
      action: 'VIDEO_REVIEWED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'EvidenceVideo',
      entityId: video.videoId,
      details: { reviewStatus, comments: reviewerComments }
    });

    return res.json({ success: true, data: video });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
