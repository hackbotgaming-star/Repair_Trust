const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrder');
const Asset = require('../models/Asset');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorizeRoles, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { screenEvidenceFile } = require('../services/evidenceScreeningService');
const { auditWorkOrder } = require('../services/auditorService');
const { generateSequentialId } = require('../utils/idGenerator');

// Helper to check worker ownership and authorization
function hasWorkerPermission(order, user) {
  if (!user) return false;
  if (user.role === 'administrator' || user.role === 'engineer') return true;
  if (user.role === 'field_worker') {
    if (order.assignedTo && order.assignedTo.toString() === user._id.toString()) return true;
    if (order.assignedWorkerName && order.assignedWorkerName.toLowerCase().includes(user.name.toLowerCase().split(' ')[0])) return true;
    return false;
  }
  return false;
}

// Haversine distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// List work orders (supports myTasks filter for workers)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, assetId, priority, auditorStatus, search, myTasks, page = 1, limit = 25 } = req.query;
    const query = {};

    if (myTasks === 'true' || (req.user && req.user.role === 'field_worker' && !req.query.all)) {
      if (req.user) {
        query.$or = [
          { assignedTo: req.user._id },
          { assignedWorkerName: { $regex: req.user.name.split(' ')[0], $options: 'i' } }
        ];
      }
    }

    if (status && status !== 'All' && status !== 'undefined' && status !== 'null') query.status = status;
    if (assetId) query.assetId = assetId.toUpperCase();
    if (priority && priority !== 'All') query.priority = priority;
    if (auditorStatus) query.closureAuditorStatus = auditorStatus;
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { workOrderId: searchRegex },
        { problemDescription: searchRegex },
        { assetId: searchRegex }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [orders, total] = await Promise.all([
      WorkOrder.find(query)
        .populate('videoEvidence')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      WorkOrder.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: orders,
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

// Single Work Order
router.get('/:workOrderId', async (req, res) => {
  try {
    const order = await WorkOrder.findOne({ 
      workOrderId: req.params.workOrderId.toUpperCase() 
    }).populate('videoEvidence');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const asset = await Asset.findOne({ assetId: order.assetId });
    const auditResult = await auditWorkOrder(order, asset);

    return res.json({
      success: true,
      data: order,
      auditorEvaluation: auditResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create Work Order (Admin / Engineer)
router.post('/', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const nextId = await generateSequentialId(WorkOrder, 'workOrderId', 'WO');

    const {
      assetId,
      linkedComplaintIds,
      problemDescription,
      assignedWorkerName,
      assignedTeam,
      priority,
      dueDate,
      repairType,
      requiredEvidenceChecklist
    } = req.body;

    const targetAssetId = assetId.toUpperCase();
    const asset = await Asset.findOne({ assetId: targetAssetId });
    if (!asset) {
      return res.status(404).json({ success: false, message: `Asset ${targetAssetId} does not exist.` });
    }

    const order = new WorkOrder({
      workOrderId: nextId,
      assetId: targetAssetId,
      linkedComplaintIds: linkedComplaintIds || [],
      problemDescription,
      assignedWorkerName: assignedWorkerName || 'Ramesh Kumar (Zone 4 Field Team)',
      assignedTeam: assignedTeam || 'Zone 4 Field Maintenance Squad B',
      priority: priority || 'High',
      dueDate: dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      repairType: repairType || 'Drain De-silting & Cleaning',
      requiredEvidenceChecklist: requiredEvidenceChecklist || {
        beforePhotoRequired: true,
        duringPhotoRequired: true,
        afterPhotoRequired: true,
        videoProofRequired: true,
        completionNoteRequired: true
      },
      status: 'Assigned',
      closureAuditorStatus: 'Incomplete',
      auditLog: [{
        action: 'CREATED_AND_ASSIGNED',
        performedBy: req.user.name || req.user.email,
        role: req.user.role,
        note: `Created repair assignment for asset ${targetAssetId}.`,
        newStatus: 'Assigned'
      }]
    });

    // Run initial audit
    const initialAudit = await auditWorkOrder(order, asset);
    order.closureAuditorStatus = initialAudit.closureAuditorStatus;
    order.closureAuditorFlags = initialAudit.closureAuditorFlags;

    await order.save();

    // Link complaints if any
    if (linkedComplaintIds && linkedComplaintIds.length > 0) {
      await Complaint.updateMany(
        { complaintId: { $in: linkedComplaintIds } },
        { $set: { status: 'Assigned', linkedWorkOrderId: order.workOrderId } }
      );
    }

    await AuditLog.create({
      action: 'WORK_ORDER_CREATED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'WorkOrder',
      entityId: order.workOrderId,
      details: { assetId: targetAssetId, repairType: order.repairType }
    });

    return res.status(201).json({ success: true, data: order });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Worker Status Transition (Accept, Start, Pause, Resume)
router.put('/:workOrderId/status', authenticate, async (req, res) => {
  try {
    const { status, pauseReason, note } = req.body;
    const order = await WorkOrder.findOne({ workOrderId: req.params.workOrderId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (!hasWorkerPermission(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to modify tasks assigned to another worker.'
      });
    }

    if ((status === 'Approved' || status === 'Closed') && req.user.role === 'field_worker') {
      return res.status(403).json({
        success: false,
        message: 'Workers cannot self-verify or approve work orders. Independent engineering verification is required.'
      });
    }

    if (status === 'Paused' && !pauseReason) {
      return res.status(400).json({
        success: false,
        message: 'A pause reason is required when placing an active work order on hold.'
      });
    }

    const previousStatus = order.status;
    order.status = status;
    if (pauseReason !== undefined) order.pauseReason = pauseReason;

    order.auditLog.push({
      action: `STATUS_CHANGE_TO_${status.toUpperCase().replace(/\s+/g, '_')}`,
      performedBy: req.user.name || req.user.email,
      role: req.user.role,
      note: note || (pauseReason ? `Paused: ${pauseReason}` : `Status transitioned to ${status}`),
      previousStatus,
      newStatus: status,
      timestamp: new Date()
    });

    // Run closure audit
    const asset = await Asset.findOne({ assetId: order.assetId });
    const auditResult = await auditWorkOrder(order, asset);
    order.closureAuditorStatus = auditResult.closureAuditorStatus;
    order.closureAuditorFlags = auditResult.closureAuditorFlags;

    await order.save();

    return res.json({ success: true, data: order, auditorEvaluation: auditResult });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Worker Update Materials & Work Notes
router.put('/:workOrderId/materials', authenticate, async (req, res) => {
  try {
    const { materialsUsed, completionNotes } = req.body;
    const order = await WorkOrder.findOne({ workOrderId: req.params.workOrderId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (!hasWorkerPermission(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to update materials for another worker.'
      });
    }

    if (materialsUsed !== undefined) order.materialsUsed = materialsUsed;
    if (completionNotes !== undefined) order.completionNotes = completionNotes;

    order.auditLog.push({
      action: 'MATERIALS_AND_NOTES_UPDATED',
      performedBy: req.user.name || req.user.email,
      role: req.user.role,
      note: `Updated ${materialsUsed ? materialsUsed.length : 0} materials items and work notes`,
      previousStatus: order.status,
      newStatus: order.status,
      timestamp: new Date()
    });

    const asset = await Asset.findOne({ assetId: order.assetId });
    const auditResult = await auditWorkOrder(order, asset);
    order.closureAuditorStatus = auditResult.closureAuditorStatus;
    order.closureAuditorFlags = auditResult.closureAuditorFlags;

    await order.save();

    return res.json({ success: true, data: order, auditorEvaluation: auditResult });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Worker Check-In / Check-Out
router.post('/:workOrderId/check-in', authenticate, async (req, res) => {
  try {
    const { coordinates, isManualEntry, manualReason, notes, type = 'check-in' } = req.body;
    const order = await WorkOrder.findOne({ workOrderId: req.params.workOrderId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (!hasWorkerPermission(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to check in to this task.'
      });
    }

    const asset = await Asset.findOne({ assetId: order.assetId });
    let distanceMeters = null;
    if (coordinates?.lat && coordinates?.lng && asset?.location?.coordinates) {
      distanceMeters = calculateDistanceMeters(
        coordinates.lat,
        coordinates.lng,
        asset.location.coordinates.lat,
        asset.location.coordinates.lng
      );
    }

    const checkInRecord = {
      workerId: req.user._id,
      workerName: req.user.name,
      timestamp: new Date(),
      type,
      coordinates: coordinates || null,
      distanceMeters,
      isManualEntry: Boolean(isManualEntry),
      manualReason: manualReason || '',
      notes: notes || ''
    };

    if (!order.checkIns) order.checkIns = [];
    order.checkIns.push(checkInRecord);

    order.auditLog.push({
      action: type === 'check-out' ? 'WORKER_CHECK_OUT' : 'WORKER_CHECK_IN',
      performedBy: req.user.name,
      role: req.user.role,
      note: isManualEntry
        ? `Manual ${type}: ${manualReason}`
        : `GPS ${type}: ${distanceMeters !== null ? distanceMeters + 'm from asset' : 'Coordinates acquired'}`,
      previousStatus: order.status,
      newStatus: order.status,
      timestamp: new Date()
    });

    await order.save();

    return res.json({
      success: true,
      data: order,
      checkIn: checkInRecord,
      message: `Successfully recorded ${type} for ${order.workOrderId}`
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Worker Update Progress (Worker / Engineer / Admin)
router.put('/:workOrderId/progress', authenticate, async (req, res) => {
  try {
    const { status, completionNotes, materialsUsed } = req.body;
    const order = await WorkOrder.findOne({ workOrderId: req.params.workOrderId.toUpperCase() });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (!hasWorkerPermission(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to modify tasks assigned to another worker.'
      });
    }

    if ((status === 'Approved' || status === 'Closed') && req.user.role === 'field_worker') {
      return res.status(403).json({
        success: false,
        message: 'Workers cannot self-verify or approve work orders. Independent engineering verification is required.'
      });
    }

    const previousStatus = order.status;
    if (status) order.status = status;
    if (completionNotes !== undefined) order.completionNotes = completionNotes;
    if (materialsUsed) order.materialsUsed = materialsUsed;

    order.auditLog.push({
      action: 'PROGRESS_UPDATED',
      performedBy: req.user.name || req.user.email,
      role: req.user.role,
      note: completionNotes ? `Notes: ${completionNotes}` : 'Progress status updated',
      previousStatus,
      newStatus: order.status
    });

    // Run closure audit
    const asset = await Asset.findOne({ assetId: order.assetId });
    const auditResult = await auditWorkOrder(order, asset);
    order.closureAuditorStatus = auditResult.closureAuditorStatus;
    order.closureAuditorFlags = auditResult.closureAuditorFlags;

    await order.save();

    return res.json({ success: true, data: order, auditorEvaluation: auditResult });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Worker Add Photo Evidence with Multipart Upload & Fraud Screening
router.post('/:workOrderId/evidence', authenticate, upload.any(), async (req, res) => {
  try {
    const { stage, url, caption } = req.body; // stage: 'before' | 'during' | 'after'
    const order = await WorkOrder.findOne({ workOrderId: req.params.workOrderId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (!hasWorkerPermission(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to upload evidence to another worker\'s task.'
      });
    }

    if (!['before', 'during', 'after'].includes(stage)) {
      return res.status(400).json({ success: false, message: "Stage must be 'before', 'during', or 'after'" });
    }

    const files = req.files || (req.file ? [req.file] : []);
    const newEvidenceItems = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const screening = await screenEvidenceFile({
          filePath: file.path,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          complaintId: order.workOrderId,
          category: 'FieldWorkEvidence'
        });

        const item = {
          url: screening.publicUrl,
          caption: caption || `${stage.toUpperCase()} repair evidence: ${file.originalname}`,
          type: 'photo',
          timestamp: new Date(),
          sha256Hash: screening.sha256Hash,
          screeningStatus: screening.status,
          fileSize: file.size,
          dimensions: screening.dimensions,
          uploadedBy: req.user.name
        };
        newEvidenceItems.push(item);
      }
    } else if (url) {
      newEvidenceItems.push({
        url,
        caption: caption || `${stage.toUpperCase()} repair evidence photo`,
        type: 'photo',
        timestamp: new Date(),
        uploadedBy: req.user.name
      });
    } else {
      return res.status(400).json({ success: false, message: 'Evidence file or image URL is required.' });
    }

    if (stage === 'before') order.beforeEvidence.push(...newEvidenceItems);
    else if (stage === 'during') order.duringEvidence.push(...newEvidenceItems);
    else if (stage === 'after') order.afterEvidence.push(...newEvidenceItems);

    order.auditLog.push({
      action: 'EVIDENCE_PHOTO_ADDED',
      performedBy: req.user.name || req.user.email,
      role: req.user.role,
      note: `Added ${newEvidenceItems.length} ${stage} evidence photo(s)`,
      previousStatus: order.status,
      newStatus: order.status,
      timestamp: new Date()
    });

    // Run closure audit update
    const asset = await Asset.findOne({ assetId: order.assetId });
    const auditResult = await auditWorkOrder(order, asset);
    order.closureAuditorStatus = auditResult.closureAuditorStatus;
    order.closureAuditorFlags = auditResult.closureAuditorFlags;

    await order.save();

    return res.json({
      success: true,
      data: order,
      auditorEvaluation: auditResult,
      addedItems: newEvidenceItems
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Worker Submit Auditable Revision (for tasks returned for more evidence)
router.post('/:workOrderId/revision', authenticate, async (req, res) => {
  try {
    const { notes } = req.body;
    const order = await WorkOrder.findOne({ workOrderId: req.params.workOrderId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (!hasWorkerPermission(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to submit revisions for another worker.'
      });
    }

    if (!order.revisions) order.revisions = [];
    const revNum = order.revisions.length + 1;
    order.revisions.push({
      revisionNumber: revNum,
      submittedAt: new Date(),
      notes: notes || `Revision #${revNum} submitted with additional requested evidence.`,
      evidenceAddedCount: (order.afterEvidence?.length || 0) + (order.duringEvidence?.length || 0)
    });

    const previousStatus = order.status;
    order.status = 'Submitted for Review';
    order.closureAuditorStatus = 'Under Review';

    order.auditLog.push({
      action: 'REVISION_SUBMITTED',
      performedBy: req.user.name || req.user.email,
      role: req.user.role,
      note: `Submitted revision #${revNum}: ${notes || 'Updated evidence submitted for re-review'}`,
      previousStatus,
      newStatus: 'Submitted for Review',
      timestamp: new Date()
    });

    await order.save();

    return res.json({
      success: true,
      message: `Revision #${revNum} submitted for engineering re-review.`,
      data: order
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Worker Submit Work Order for Engineer Review
router.post('/:workOrderId/submit', authenticate, async (req, res) => {
  try {
    const order = await WorkOrder.findOne({ 
      workOrderId: req.params.workOrderId.toUpperCase() 
    }).populate('videoEvidence');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    if (!hasWorkerPermission(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to submit work orders assigned to another worker.'
      });
    }

    const asset = await Asset.findOne({ assetId: order.assetId });
    const auditResult = await auditWorkOrder(order, asset);

    order.submittedAt = new Date();
    order.status = 'Submitted for Review';
    order.closureAuditorStatus = auditResult.closureAuditorStatus;
    order.closureAuditorFlags = auditResult.closureAuditorFlags;

    order.auditLog.push({
      action: 'SUBMITTED_FOR_REVIEW',
      performedBy: req.user.name || req.user.email,
      role: req.user.role,
      note: `Work order submitted for review with auditor evaluation: ${auditResult.closureAuditorStatus}`,
      previousStatus: 'In Progress',
      newStatus: 'Submitted for Review'
    });

    await order.save();

    // Update linked complaints to In Progress
    if (order.linkedComplaintIds && order.linkedComplaintIds.length > 0) {
      await Complaint.updateMany(
        { complaintId: { $in: order.linkedComplaintIds } },
        { 
          $set: { 
            status: 'In Progress', 
            publicStatusUpdate: 'Repair crew has completed field operations; pending municipal engineer verification.' 
          } 
        }
      );
    }

    await AuditLog.create({
      action: 'WORK_ORDER_SUBMITTED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'WorkOrder',
      entityId: order.workOrderId,
      details: { auditorStatus: auditResult.closureAuditorStatus, isComplete: auditResult.isComplete }
    });

    return res.json({
      success: true,
      message: 'Work order submitted for engineering review.',
      data: order,
      auditorEvaluation: auditResult
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Engineer Review & Sign-Off (Approve, Return, Reject)
router.post('/:workOrderId/review', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const { decision, comments } = req.body; // decision: 'Approved' | 'Returned' | 'Rejected'
    const order = await WorkOrder.findOne({ 
      workOrderId: req.params.workOrderId.toUpperCase() 
    }).populate('videoEvidence');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const previousStatus = order.status;
    order.reviewedAt = new Date();
    order.reviewedBy = req.user._id;
    order.engineerDecision = decision;
    order.engineerComments = comments || '';

    if (decision === 'Approved') {
      order.status = 'Approved';
      order.closureAuditorStatus = 'Approved';
    } else if (decision === 'Unverified') {
      order.status = 'Returned for More Evidence';
      order.closureAuditorStatus = 'Unverified';
    } else if (decision === 'Returned') {
      order.status = 'Returned for More Evidence';
      order.closureAuditorStatus = 'Incomplete';
    } else if (decision === 'Reopened') {
      order.status = 'Reopened';
      order.closureAuditorStatus = 'Reopened';
    } else {
      order.status = 'Returned for More Evidence';
      order.closureAuditorStatus = 'Incomplete';
    }

    order.auditLog.push({
      action: `ENGINEER_DECISION_${decision.toUpperCase()}`,
      performedBy: req.user.name || req.user.email,
      role: req.user.role,
      note: comments || `Work order ${decision} by municipal engineer.`,
      previousStatus,
      newStatus: order.status
    });

    await order.save();

    // If approved, update linked complaints to Resolved
    if (decision === 'Approved' && order.linkedComplaintIds && order.linkedComplaintIds.length > 0) {
      await Complaint.updateMany(
        { complaintId: { $in: order.linkedComplaintIds } },
        { 
          $set: { 
            status: 'Resolved', 
            publicStatusUpdate: 'Repair verified and signed off by Municipal Engineer. Issue resolved.' 
          } 
        }
      );
    }

    await AuditLog.create({
      action: 'WORK_ORDER_REVIEWED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'WorkOrder',
      entityId: order.workOrderId,
      details: { decision, comments }
    });

    return res.json({
      success: true,
      message: `Work order successfully recorded with decision: ${decision}.`,
      data: order
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Engineer Reopen Work Order (e.g. after recurring citizen complaints or failed post-repair audit)
router.post('/:workOrderId/reopen', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'A documented reason is required to reopen a work order.' });
    }

    const order = await WorkOrder.findOne({ workOrderId: req.params.workOrderId.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found.' });
    }

    const previousStatus = order.status;
    order.status = 'Reopened';
    order.closureAuditorStatus = 'Reopened';
    order.auditLog.push({
      action: 'WORK_ORDER_REOPENED',
      performedBy: req.user.name || req.user.email,
      role: req.user.role,
      note: reason.trim(),
      previousStatus,
      newStatus: 'Reopened'
    });

    await order.save();

    // Reopen linked complaints as well
    if (order.linkedComplaintIds && order.linkedComplaintIds.length > 0) {
      await Complaint.updateMany(
        { complaintId: { $in: order.linkedComplaintIds } },
        {
          $set: {
            status: 'REOPENED',
            publicStatusUpdate: `Work order ${order.workOrderId} reopened for investigation: "${reason.trim()}".`
          }
        }
      );
    }

    await AuditLog.create({
      action: 'WORK_ORDER_REOPENED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'WorkOrder',
      entityId: order.workOrderId,
      details: { reason, previousStatus }
    });

    return res.json({
      success: true,
      message: `Work order ${order.workOrderId} reopened successfully.`,
      data: order
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Run Closure Auditor on demand
router.get('/:workOrderId/audit', async (req, res) => {
  try {
    const order = await WorkOrder.findOne({ 
      workOrderId: req.params.workOrderId.toUpperCase() 
    }).populate('videoEvidence');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const asset = await Asset.findOne({ assetId: order.assetId });
    const auditResult = await auditWorkOrder(order, asset);

    return res.json({ success: true, data: auditResult });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
