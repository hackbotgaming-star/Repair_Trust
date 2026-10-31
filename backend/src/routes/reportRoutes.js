const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const WorkOrder = require('../models/WorkOrder');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorizeRoles } = require('../middleware/auth');

/**
 * Helper to convert array of objects to CSV string
 */
const convertToCSV = (items, headers) => {
  if (!items || !items.length) return headers.join(',') + '\n';
  const csvRows = [headers.join(',')];
  for (const item of items) {
    const row = headers.map(header => {
      let val = item[header];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') {
        val = JSON.stringify(val).replace(/"/g, '""');
      } else {
        val = String(val).replace(/"/g, '""');
      }
      return `"${val}"`;
    });
    csvRows.push(row.join(','));
  }
  return csvRows.join('\n');
};

/**
 * GET /api/v1/reports/summary
 * Returns engineering summary statistics
 */
router.get('/summary', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const [assets, complaints, workOrders, auditLogs] = await Promise.all([
      Asset.find(),
      Complaint.find(),
      WorkOrder.find(),
      AuditLog.countDocuments()
    ]);

    const repeatFailureAssets = assets.filter(a => a.repeatFailureFlag || a.repeatFailureCount > 0);
    const unverifiedWorkOrders = workOrders.filter(w => w.closureAuditorStatus === 'Unverified');
    const incompleteWorkOrders = workOrders.filter(w => w.closureAuditorStatus === 'Incomplete');
    const approvedWorkOrders = workOrders.filter(w => w.closureAuditorStatus === 'Approved');

    return res.json({
      success: true,
      data: {
        totalAssets: assets.length,
        totalComplaints: complaints.length,
        openComplaints: complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length,
        totalWorkOrders: workOrders.length,
        approvedRepairs: approvedWorkOrders.length,
        unverifiedRepairs: unverifiedWorkOrders.length,
        incompleteRepairs: incompleteWorkOrders.length,
        repeatFailureAssetsCount: repeatFailureAssets.length,
        totalAuditLogs: auditLogs,
        generatedAt: new Date(),
        reportingOfficer: req.user.name || req.user.email
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/v1/reports/export
 * Exports datasets in CSV or JSON format and records an auditable trail
 */
router.post('/export', authenticate, authorizeRoles('administrator', 'engineer'), async (req, res) => {
  try {
    const { dataset, format = 'csv', filters = {} } = req.body;
    let records = [];
    let headers = [];
    let filename = `repairtrust_${dataset}_${new Date().toISOString().split('T')[0]}`;

    if (dataset === 'complaints') {
      const q = {};
      if (filters.status) q.status = filters.status;
      if (filters.ward) q['location.ward'] = filters.ward;
      const list = await Complaint.find(q).sort({ createdAt: -1 }).limit(1000);
      records = list.map(c => ({
        complaintId: c.complaintId,
        assetId: c.assetId || '',
        category: c.category,
        severity: c.severity,
        status: c.status,
        street: c.location?.street || '',
        ward: c.location?.ward || '',
        submittedAt: c.createdAt ? new Date(c.createdAt).toISOString() : '',
        publicStatusUpdate: c.publicStatusUpdate || ''
      }));
      headers = ['complaintId', 'assetId', 'category', 'severity', 'status', 'street', 'ward', 'submittedAt', 'publicStatusUpdate'];
    } else if (dataset === 'work-orders') {
      const q = {};
      if (filters.status) q.status = filters.status;
      const list = await WorkOrder.find(q).sort({ createdAt: -1 }).limit(1000);
      records = list.map(w => ({
        workOrderId: w.workOrderId,
        assetId: w.assetId,
        repairType: w.repairType,
        status: w.status,
        priority: w.priority,
        assignedWorker: w.assignedWorkerName || '',
        closureAuditorStatus: w.closureAuditorStatus || '',
        beforePhotosCount: w.beforeEvidence?.length || 0,
        duringPhotosCount: w.duringEvidence?.length || 0,
        afterPhotosCount: w.afterEvidence?.length || 0,
        hasVideoProof: w.videoEvidence?.length > 0 ? 'Yes' : 'No',
        dueDate: w.dueDate ? new Date(w.dueDate).toISOString() : ''
      }));
      headers = ['workOrderId', 'assetId', 'repairType', 'status', 'priority', 'assignedWorker', 'closureAuditorStatus', 'beforePhotosCount', 'duringPhotosCount', 'afterPhotosCount', 'hasVideoProof', 'dueDate'];
    } else if (dataset === 'assets') {
      const list = await Asset.find().sort({ assetId: 1 }).limit(1000);
      records = list.map(a => ({
        assetId: a.assetId,
        name: a.name,
        type: a.type,
        status: a.status,
        ward: a.location?.ward || '',
        street: a.location?.street || '',
        riskLevel: a.riskLevel,
        repeatFailureFlag: a.repeatFailureFlag ? 'True' : 'False',
        repeatFailureCount: a.repeatFailureCount || 0,
        debrisSeverityIndex: a.debrisSeverityIndex || 0,
        capacityRatio: a.capacityRatio || 0
      }));
      headers = ['assetId', 'name', 'type', 'status', 'ward', 'street', 'riskLevel', 'repeatFailureFlag', 'repeatFailureCount', 'debrisSeverityIndex', 'capacityRatio'];
    } else if (dataset === 'audit-log') {
      const list = await AuditLog.find().sort({ timestamp: -1 }).limit(1000);
      records = list.map(a => ({
        action: a.action,
        performedBy: a.performedBy,
        userRole: a.userRole,
        entityType: a.entityType,
        entityId: a.entityId,
        timestamp: a.timestamp ? new Date(a.timestamp).toISOString() : ''
      }));
      headers = ['action', 'performedBy', 'userRole', 'entityType', 'entityId', 'timestamp'];
    } else {
      return res.status(400).json({ success: false, message: `Unsupported dataset "${dataset}".` });
    }

    // Record audit event for export compliance
    await AuditLog.create({
      action: 'DATA_EXPORT_GENERATED',
      performedBy: req.user.email,
      userRole: req.user.role,
      entityType: 'ExportReport',
      entityId: filename,
      details: {
        dataset,
        format,
        recordCount: records.length,
        timestamp: new Date()
      }
    });

    if (format === 'json') {
      return res.json({
        success: true,
        dataset,
        count: records.length,
        exportedAt: new Date(),
        data: records
      });
    }

    // Default CSV output
    const csvContent = convertToCSV(records, headers);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
