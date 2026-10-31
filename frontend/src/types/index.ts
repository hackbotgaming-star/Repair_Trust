export type Role = 'administrator' | 'engineer' | 'field_worker' | 'citizen';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  badgeNumber?: string;
  phone?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Asset {
  _id?: string;
  assetId: string;
  name: string;
  type: 'storm-water drain' | 'culvert' | 'road';
  status: 'Active' | 'Maintenance Required' | 'Under Investigation' | 'Decommissioned';
  location: {
    street: string;
    ward: string;
    municipality: string;
    coordinates: Coordinates;
  };
  dimensions?: {
    lengthMeters: number;
    depthMeters: number;
    widthMeters: number;
    diameterMm: number;
    material: string;
  };
  installationYear?: number;
  lastInspectedAt?: string;
  debrisSeverityIndex: number;
  capacityRatio: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  riskScore: number;
  repeatFailureFlag: boolean;
  repeatFailureCount: number;
  downstreamAssetId?: string;
  recommendedAction?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Complaint {
  _id?: string;
  complaintId: string;
  assetId: string;
  category: string;
  description: string;
  reporterDetails: {
    name: string;
    phone?: string;
    email?: string;
    isAnonymous?: boolean;
  };
  location: {
    street: string;
    ward: string;
    landmark?: string;
    coordinates: Coordinates;
  };
  publicLocation?: {
    generalizedStreet?: string;
    ward?: string;
    coordinates?: Coordinates;
  };
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status:
    | 'Submitted'
    | 'Reviewed'
    | 'Assigned'
    | 'In Progress'
    | 'Resolved'
    | 'Closed'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'ASSIGNED'
    | 'WORK_IN_PROGRESS'
    | 'REPAIR_SUBMITTED'
    | 'VERIFIED_RESOLVED'
    | 'REJECTED_WITH_REASON'
    | 'DISPUTED'
    | 'REOPENED'
    | 'EVIDENCE_REVIEW_REQUIRED'
    | string;
  photos?: string[];
  assignedDepartment?: string;
  linkedWorkOrderId?: string;
  publicStatusUpdate?: string;
  rejectionReason?: string;
  isDuplicate?: boolean;
  duplicateOf?: string;
  disputes?: Array<{
    disputeId: string;
    reason: string;
    evidencePhotos?: string[];
    submittedBy?: string;
    submittedAt?: string;
    status: string;
  }>;
  citizenFeedback?: Array<{
    outcome: string;
    notes?: string;
    photos?: string[];
    submittedAt?: string;
  }>;
  closureVerification?: {
    verifiedBy?: string;
    verifiedAt?: string;
    method?: string;
    notes?: string;
    beforePhotos?: string[];
    afterPhotos?: string[];
    videoProofId?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface EvidenceItem {
  url: string;
  type: 'photo' | 'document' | 'note' | 'video';
  caption: string;
  timestamp: string;
}

export interface AuditorFlag {
  code: string;
  rule: string;
  message: string;
  severity: 'warning' | 'error' | 'info';
  checkedAt?: string;
}

export interface WorkOrder {
  _id?: string;
  workOrderId: string;
  assetId: string;
  linkedComplaintIds?: string[];
  problemDescription: string;
  assignedWorkerName: string;
  assignedTeam: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  repairType: string;
  requiredEvidenceChecklist: {
    beforePhotoRequired: boolean;
    duringPhotoRequired: boolean;
    afterPhotoRequired: boolean;
    videoProofRequired: boolean;
    completionNoteRequired: boolean;
  };
  status:
    | 'Created'
    | 'Assigned'
    | 'In Progress'
    | 'Paused'
    | 'On Hold'
    | 'Submitted for Review'
    | 'Approved'
    | 'Returned for More Evidence'
    | 'Closed'
    | 'Reopened';
  closureAuditorStatus: 'Complete' | 'Incomplete' | 'Under Review' | 'Unverified' | 'Approved' | 'Reopened';
  closureAuditorFlags: AuditorFlag[];
  beforeEvidence: EvidenceItem[];
  duringEvidence: EvidenceItem[];
  afterEvidence: EvidenceItem[];
  videoEvidence?: EvidenceVideo[];
  completionNotes?: string;
  materialsUsed?: { item: string; quantity: string }[];
  submittedAt?: string;
  reviewedAt?: string;
  engineerDecision: 'Approved' | 'Returned' | 'Rejected' | 'Pending Review' | 'Unverified' | 'Reopened';
  engineerComments?: string;
  auditLog: {
    action: string;
    performedBy: string;
    role: string;
    note: string;
    timestamp: string;
    previousStatus?: string;
    newStatus?: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface EvidenceVideo {
  _id?: string;
  videoId: string;
  workOrderId: string;
  assetId: string;
  submittedByName: string;
  fileUrl: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  durationSeconds: number;
  stage: 'before_cleaning' | 'during_operation' | 'post_completion_flow' | 'combined_walkthrough';
  clientProvidedMetadata: {
    clientTimestamp: string;
    userAgent: string;
    isLiveCameraCapture: boolean;
    reportedCoordinates?: Coordinates;
  };
  serverVerifiedMetadata: {
    receivedAt: string;
    integrityCheckPassed: boolean;
    allowedFormat: boolean;
  };
  reviewStatus: 'Pending Review' | 'Accepted' | 'Needs Additional Footage' | 'Rejected';
  reviewerComments?: string;
  createdAt: string;
}

export interface Inspection {
  _id?: string;
  inspectionId: string;
  assetId: string;
  inspectorName: string;
  inspectionType: string;
  date: string;
  findings: {
    debrisLevel: string;
    structuralIntegrity: string;
    downstreamFlowClear: boolean;
    siltDepthCm: number;
    waterVelocityMps?: number;
    notes: string;
  };
  photos?: string[];
  recommendation?: {
    actionRequired: boolean;
    suggestedRepairType?: string;
    urgency: string;
  };
}

export interface Hypothesis {
  cause: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  confidenceScore: number;
  evidenceCitationRecords: string[];
}

export interface Investigation {
  _id?: string;
  investigationId: string;
  assetId: string;
  triggerReason: string;
  status: 'Active Investigation' | 'Pending Physical Inspection' | 'Resolved with Root Cause' | 'Closed';
  hypotheses: Hypothesis[];
  recommendedNextInspection: {
    suggestedAction: string;
    missingEvidence: string;
    hypothesesDistinguished: string[];
    expectedBenefit: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'Scheduled' | 'Completed';
    recommendedAt: string;
  };
  repeatFailureRiskScore: number;
  aiConfidence: number;
  engineerFeedback?: {
    conclusion: string;
    reviewedBy: string;
    reviewedAt?: string;
    actionTaken: string;
  };
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  summary: string;
  status?: string;
  badgeColor?: 'teal' | 'amber' | 'red' | 'blue' | 'green';
  referenceId?: string;
  details?: any;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  status?: string;
  data: any;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  label: string;
}

export interface MemoryGraphData {
  assetId: string;
  asset: Asset;
  timeline: TimelineEvent[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  metrics: {
    totalTimelineEvents: number;
    complaintCount: number;
    workOrderCount: number;
    videoCount: number;
    inspectionCount: number;
    repeatFailureFlag: boolean;
  };
}

export interface AnalyticsKPIs {
  totalAssets: number;
  openComplaints: number;
  activeWorkOrders: number;
  repairsAwaitingReview: number;
  repeatFailureCases: number;
  missingEvidenceCases: number;
  assetsRequiringInspection: number;
  avgTimeToReviewHours: number;
  repeatFailureRate: number;
  evidenceCompletenessRate: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  definitions: {
    observationWindowDays: number;
    repeatFailureRateFormula: string;
    evidenceCompletenessFormula: string;
    denominatorEligibleAssets: number;
    numeratorRepeatCases: number;
  };
  wardBreakdown: {
    ward: string;
    totalAssets: number;
    highRiskAssets: number;
    openComplaints: number;
    workOrders: number;
  }[];
  riskDistribution: { name: string; count: number; color: string }[];
  repairTypeBreakdown: { name: string; count: number }[];
  auditorStatusBreakdown: { name: string; count: number; color: string }[];
}
