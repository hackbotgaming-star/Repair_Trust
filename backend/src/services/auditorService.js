/**
 * Closure Auditor Service (Core Module 6)
 * Deterministic rule-based auditor enforcing evidence standards without prejudice.
 */

const auditWorkOrder = async (workOrder, asset = null) => {
  const flags = [];
  const checklist = workOrder.requiredEvidenceChecklist || {
    beforePhotoRequired: true,
    duringPhotoRequired: true,
    afterPhotoRequired: true,
    videoProofRequired: true,
    completionNoteRequired: true
  };

  // Rule 1: Check Before Evidence
  const hasBefore = workOrder.beforeEvidence && workOrder.beforeEvidence.length > 0;
  if (checklist.beforePhotoRequired && !hasBefore) {
    flags.push({
      code: 'MISSING_BEFORE_EVIDENCE',
      rule: 'Pre-repair baseline documentation mandatory',
      message: 'Before-work photographs or baseline condition records are missing.',
      severity: 'warning',
      checkedAt: new Date()
    });
  }

  // Rule 2: Check During Evidence
  const hasDuring = workOrder.duringEvidence && workOrder.duringEvidence.length > 0;
  if (checklist.duringPhotoRequired && !hasDuring) {
    flags.push({
      code: 'MISSING_DURING_EVIDENCE',
      rule: 'In-progress procedure documentation mandatory',
      message: 'During-work photographs documenting de-silting/repair actions in progress are missing.',
      severity: 'info',
      checkedAt: new Date()
    });
  }

  // Rule 3: Check After Evidence
  const hasAfter = workOrder.afterEvidence && workOrder.afterEvidence.length > 0;
  if (checklist.afterPhotoRequired && !hasAfter) {
    flags.push({
      code: 'MISSING_AFTER_EVIDENCE',
      rule: 'Post-repair condition proof mandatory',
      message: 'Post-repair/after-cleaning photographs proving clear culvert/drain invert are missing.',
      severity: 'error',
      checkedAt: new Date()
    });
  }

  // Rule 4: Check LiveWork Proof Video
  const hasVideo = workOrder.videoEvidence && workOrder.videoEvidence.length > 0;
  if (checklist.videoProofRequired && !hasVideo) {
    flags.push({
      code: 'MISSING_VIDEO_PROOF',
      rule: 'LiveWork Proof video mandatory',
      message: 'Task-specific walkthrough or live-recorded video evidence has not been submitted.',
      severity: 'error',
      checkedAt: new Date()
    });
  }

  // Rule 5: Check Completion Notes & Materials
  const hasNotes = workOrder.completionNotes && workOrder.completionNotes.trim().length > 10;
  if (checklist.completionNoteRequired && !hasNotes) {
    flags.push({
      code: 'MISSING_COMPLETION_NOTES',
      rule: 'Completion narrative and action record required',
      message: 'Worker completion notes must detail specific actions taken and silt/debris removal volume.',
      severity: 'warning',
      checkedAt: new Date()
    });
  }

  // Rule 6: Asset Repeat Failure Context
  if (asset && asset.repeatFailureFlag) {
    flags.push({
      code: 'REPEAT_FAILURE_PATTERN',
      rule: 'Asset history indicates recurring failure within 60-day window',
      message: `Asset ${asset.assetId} has experienced ${asset.repeatFailureCount || 'multiple'} recurring overflow events after prior cleanings. Engineer review advised.`,
      severity: 'warning',
      checkedAt: new Date()
    });
  }

  // Determine Closure Auditor Status:
  // Complete | Incomplete | Under Review | Unverified | Approved
  let auditorStatus = 'Incomplete';

  if (workOrder.status === 'Approved') {
    auditorStatus = 'Approved';
  } else if (flags.some(f => f.severity === 'error')) {
    auditorStatus = 'Incomplete';
  } else if (flags.some(f => f.severity === 'warning')) {
    auditorStatus = 'Unverified';
  } else if (workOrder.status === 'Submitted for Review') {
    auditorStatus = 'Under Review';
  } else if (hasBefore && hasAfter && (!checklist.videoProofRequired || hasVideo)) {
    auditorStatus = 'Complete';
  }

  return {
    closureAuditorStatus: auditorStatus,
    closureAuditorFlags: flags,
    isComplete: flags.filter(f => f.severity === 'error').length === 0,
    summary: {
      totalFlags: flags.length,
      errors: flags.filter(f => f.severity === 'error').length,
      warnings: flags.filter(f => f.severity === 'warning').length,
      info: flags.filter(f => f.severity === 'info').length
    }
  };
};

module.exports = { auditWorkOrder };
