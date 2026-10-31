/**
 * Asset Memory Graph Service (Core Module 2)
 * Constructs a chronological timeline and directed relationship graph
 * connecting assets, complaints, work orders, LiveWork Proof videos, inspections, rainfall, and engineer decisions.
 */

const Asset = require('../models/Asset');
const Complaint = require('../models/Complaint');
const WorkOrder = require('../models/WorkOrder');
const EvidenceVideo = require('../models/EvidenceVideo');
const Inspection = require('../models/Inspection');
const Rainfall = require('../models/Rainfall');

const buildAssetMemoryGraph = async (assetId) => {
  const asset = await Asset.findOne({ assetId });
  if (!asset) {
    throw new Error(`Asset ${assetId} not found`);
  }

  const [complaints, workOrders, videos, inspections, rainfalls] = await Promise.all([
    Complaint.find({ assetId }).sort({ createdAt: 1 }),
    WorkOrder.find({ assetId }).sort({ createdAt: 1 }),
    EvidenceVideo.find({ assetId }).sort({ createdAt: 1 }),
    Inspection.find({ assetId }).sort({ date: 1 }),
    Rainfall.find({ ward: asset.location.ward }).sort({ date: 1 })
  ]);

  const timeline = [];
  const nodes = [];
  const edges = [];

  // 1. Root Asset Node
  const assetNodeId = `asset-${asset.assetId}`;
  nodes.push({
    id: assetNodeId,
    type: 'Asset',
    label: `${asset.assetId}: ${asset.name}`,
    status: asset.status,
    riskLevel: asset.riskLevel,
    data: {
      assetId: asset.assetId,
      name: asset.name,
      type: asset.type,
      ward: asset.location.ward,
      street: asset.location.street,
      riskScore: asset.riskScore,
      repeatFailureFlag: asset.repeatFailureFlag
    }
  });

  timeline.push({
    id: `tl-asset-${asset.assetId}`,
    type: 'ASSET_REGISTRATION',
    title: `Asset Registered: ${asset.assetId}`,
    timestamp: asset.createdAt || new Date(asset.installationYear, 0, 1),
    summary: `${asset.type.toUpperCase()} located at ${asset.location.street}, Ward ${asset.location.ward}`,
    status: asset.status,
    badgeColor: 'teal',
    referenceId: asset.assetId,
    details: asset
  });

  // 2. Add Complaints
  complaints.forEach((comp, idx) => {
    const compNodeId = `comp-${comp.complaintId}`;
    nodes.push({
      id: compNodeId,
      type: 'Complaint',
      label: `${comp.complaintId} (${comp.category})`,
      status: comp.status,
      severity: comp.severity,
      data: comp
    });

    edges.push({
      id: `edge-${assetNodeId}-${compNodeId}`,
      source: assetNodeId,
      target: compNodeId,
      relation: 'REPORTED_ON',
      label: 'Citizen Report'
    });

    timeline.push({
      id: `tl-${comp.complaintId}`,
      type: 'COMPLAINT',
      title: `Citizen Complaint: ${comp.complaintId}`,
      timestamp: comp.createdAt,
      summary: comp.description,
      status: comp.status,
      severity: comp.severity,
      badgeColor: comp.severity === 'Critical' || comp.severity === 'High' ? 'red' : 'amber',
      referenceId: comp.complaintId,
      details: {
        category: comp.category,
        reporter: comp.reporterDetails,
        location: comp.location,
        photos: comp.photos,
        isDuplicate: comp.isDuplicate
      }
    });
  });

  // 3. Add Work Orders
  workOrders.forEach((wo, idx) => {
    const woNodeId = `wo-${wo.workOrderId}`;
    nodes.push({
      id: woNodeId,
      type: 'WorkOrder',
      label: `${wo.workOrderId} (${wo.repairType})`,
      status: wo.status,
      auditorStatus: wo.closureAuditorStatus,
      data: wo
    });

    // Connect from Asset
    edges.push({
      id: `edge-${assetNodeId}-${woNodeId}`,
      source: assetNodeId,
      target: woNodeId,
      relation: 'SERVICED_BY',
      label: 'Maintenance Order'
    });

    // Connect from linked complaints
    if (wo.linkedComplaintIds && wo.linkedComplaintIds.length > 0) {
      wo.linkedComplaintIds.forEach(compId => {
        edges.push({
          id: `edge-comp-${compId}-${woNodeId}`,
          source: `comp-${compId}`,
          target: woNodeId,
          relation: 'ADDRESSED_BY',
          label: 'Assigned Fix'
        });
      });
    }

    timeline.push({
      id: `tl-${wo.workOrderId}`,
      type: 'WORK_ORDER',
      title: `Work Order: ${wo.workOrderId} (${wo.repairType})`,
      timestamp: wo.createdAt,
      summary: wo.problemDescription,
      status: wo.status,
      auditorStatus: wo.closureAuditorStatus,
      badgeColor: wo.status === 'Approved' ? 'green' : wo.status === 'Submitted for Review' ? 'amber' : 'blue',
      referenceId: wo.workOrderId,
      details: {
        assignedWorker: wo.assignedWorkerName,
        priority: wo.priority,
        materialsUsed: wo.materialsUsed,
        closureAuditorStatus: wo.closureAuditorStatus,
        closureAuditorFlags: wo.closureAuditorFlags
      }
    });

    // If work order was submitted with evidence
    if (wo.submittedAt) {
      timeline.push({
        id: `tl-submit-${wo.workOrderId}`,
        type: 'EVIDENCE_SUBMISSION',
        title: `Repair Evidence Submitted: ${wo.workOrderId}`,
        timestamp: wo.submittedAt,
        summary: `Worker submitted repair documentation with ${wo.beforeEvidence.length} before, ${wo.afterEvidence.length} after photos and completion notes.`,
        status: wo.closureAuditorStatus,
        badgeColor: 'teal',
        referenceId: wo.workOrderId,
        details: {
          beforeEvidence: wo.beforeEvidence,
          duringEvidence: wo.duringEvidence,
          afterEvidence: wo.afterEvidence,
          notes: wo.completionNotes
        }
      });
    }

    // If engineer made decision
    if (wo.reviewedAt || wo.engineerDecision !== 'Pending Review') {
      const decisionNodeId = `dec-${wo.workOrderId}`;
      nodes.push({
        id: decisionNodeId,
        type: 'EngineerDecision',
        label: `Decision: ${wo.engineerDecision}`,
        decision: wo.engineerDecision,
        data: {
          decision: wo.engineerDecision,
          comments: wo.engineerComments,
          reviewedAt: wo.reviewedAt
        }
      });

      edges.push({
        id: `edge-${woNodeId}-${decisionNodeId}`,
        source: woNodeId,
        target: decisionNodeId,
        relation: 'REVIEWED_AS',
        label: wo.engineerDecision
      });

      timeline.push({
        id: `tl-dec-${wo.workOrderId}`,
        type: 'ENGINEER_REVIEW',
        title: `Engineer Decision: ${wo.engineerDecision} (${wo.workOrderId})`,
        timestamp: wo.reviewedAt || wo.updatedAt,
        summary: wo.engineerComments || `Engineer signed off repair evidence as ${wo.engineerDecision}.`,
        status: wo.engineerDecision,
        badgeColor: wo.engineerDecision === 'Approved' ? 'green' : 'red',
        referenceId: wo.workOrderId,
        details: {
          comments: wo.engineerComments,
          decision: wo.engineerDecision,
          reviewedAt: wo.reviewedAt
        }
      });
    }
  });

  // 4. Add LiveWork Proof Videos
  videos.forEach(v => {
    const videoNodeId = `vid-${v.videoId}`;
    nodes.push({
      id: videoNodeId,
      type: 'LiveWorkProofVideo',
      label: `${v.videoId} [${v.stage}]`,
      reviewStatus: v.reviewStatus,
      data: v
    });

    edges.push({
      id: `edge-wo-${v.workOrderId}-${videoNodeId}`,
      source: `wo-${v.workOrderId}`,
      target: videoNodeId,
      relation: 'HAS_VIDEO_PROOF',
      label: 'Footage Upload'
    });

    timeline.push({
      id: `tl-${v.videoId}`,
      type: 'LIVEWORK_VIDEO',
      title: `LiveWork Proof Video: ${v.videoId}`,
      timestamp: v.serverVerifiedMetadata ? v.serverVerifiedMetadata.receivedAt : v.createdAt,
      summary: `Verified video evidence for stage '${v.stage}' (${v.durationSeconds}s, ${(v.fileSize / 1024 / 1024).toFixed(1)}MB).`,
      status: v.reviewStatus,
      badgeColor: v.reviewStatus === 'Accepted' ? 'green' : 'amber',
      referenceId: v.videoId,
      details: {
        fileUrl: v.fileUrl,
        stage: v.stage,
        clientMetadata: v.clientProvidedMetadata,
        serverVerified: v.serverVerifiedMetadata,
        reviewerComments: v.reviewerComments
      }
    });
  });

  // 5. Add Inspections
  inspections.forEach(ins => {
    const insNodeId = `ins-${ins.inspectionId}`;
    nodes.push({
      id: insNodeId,
      type: 'Inspection',
      label: `${ins.inspectionId}: ${ins.inspectionType}`,
      findings: ins.findings,
      data: ins
    });

    edges.push({
      id: `edge-${assetNodeId}-${insNodeId}`,
      source: assetNodeId,
      target: insNodeId,
      relation: 'INSPECTED_BY',
      label: 'Physical Audit'
    });

    timeline.push({
      id: `tl-${ins.inspectionId}`,
      type: 'INSPECTION',
      title: `Physical Inspection: ${ins.inspectionType}`,
      timestamp: ins.date,
      summary: ins.findings.notes || `Debris: ${ins.findings.debrisLevel}, Structure: ${ins.findings.structuralIntegrity}`,
      status: ins.findings.downstreamFlowClear ? 'Flow Passable' : 'Flow Obstructed',
      badgeColor: ins.findings.downstreamFlowClear ? 'green' : 'red',
      referenceId: ins.inspectionId,
      details: ins.findings
    });
  });

  // 6. Add Rainfall Events
  rainfalls.forEach(rf => {
    const rfNodeId = `rain-${rf._id}`;
    nodes.push({
      id: rfNodeId,
      type: 'Rainfall',
      label: `${rf.rainfallMm}mm Rain (${rf.intensityCategory})`,
      rainfallMm: rf.rainfallMm,
      data: rf
    });

    timeline.push({
      id: `tl-rain-${rf._id}`,
      type: 'RAINFALL_EVENT',
      title: `Rainfall Event: ${rf.rainfallMm} mm`,
      timestamp: rf.date,
      summary: `${rf.intensityCategory} recorded at station ${rf.stationName || rf.stationId}.`,
      status: rf.intensityCategory,
      badgeColor: rf.rainfallMm >= 40 ? 'red' : 'blue',
      referenceId: rf.stationId,
      details: rf
    });
  });

  // Sort full timeline chronologically descending (newest first for reading, or ascending with toggle)
  timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    assetId,
    asset,
    timeline,
    graph: {
      nodes,
      edges: edges.filter(e => new Set(nodes.map(n => n.id)).has(e.source) && new Set(nodes.map(n => n.id)).has(e.target))
    },
    metrics: {
      totalTimelineEvents: timeline.length,
      complaintCount: complaints.length,
      workOrderCount: workOrders.length,
      videoCount: videos.length,
      inspectionCount: inspections.length,
      repeatFailureFlag: asset.repeatFailureFlag
    }
  };
};

module.exports = { buildAssetMemoryGraph };
