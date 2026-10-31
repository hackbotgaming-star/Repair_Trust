/**
 * Complaint Lifecycle State Machine & Transition Rules (Section 6)
 * Enforces role authorization and validation criteria for every transition.
 */

const VALID_TRANSITIONS = {
  SUBMITTED: ['EVIDENCE_SCREENING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED_WITH_REASON', 'NEEDS_MORE_INFORMATION'],
  EVIDENCE_SCREENING: ['UNDER_REVIEW', 'EVIDENCE_REVIEW_REQUIRED', 'ACCEPTED', 'REJECTED_WITH_REASON'],
  EVIDENCE_REVIEW_REQUIRED: ['UNDER_REVIEW', 'ACCEPTED', 'NEEDS_MORE_INFORMATION', 'REJECTED_WITH_REASON'],
  UNDER_REVIEW: ['ACCEPTED', 'ASSIGNED', 'INSPECTION_REQUIRED', 'NEEDS_MORE_INFORMATION', 'REJECTED_WITH_REASON'],
  ACCEPTED: ['ASSIGNED', 'INSPECTION_REQUIRED', 'WORK_IN_PROGRESS'],
  ASSIGNED: ['WORK_IN_PROGRESS', 'INSPECTION_REQUIRED'],
  INSPECTION_REQUIRED: ['WORK_IN_PROGRESS', 'ASSIGNED'],
  WORK_IN_PROGRESS: ['REPAIR_REPORTED_COMPLETE', 'ASSIGNED', 'NEEDS_MORE_INFORMATION'],
  REPAIR_REPORTED_COMPLETE: ['AWAITING_VERIFICATION', 'VERIFIED_RESOLVED', 'WORK_IN_PROGRESS'],
  AWAITING_VERIFICATION: ['VERIFIED_RESOLVED', 'CLOSED_AFTER_REVIEW', 'WORK_IN_PROGRESS'],
  VERIFIED_RESOLVED: ['DISPUTED', 'REOPENED', 'CLOSED_AFTER_REVIEW'],
  DISPUTED: ['UNDER_REVIEW', 'REOPENED', 'INSPECTION_REQUIRED', 'CLOSED_AFTER_REVIEW'],
  REOPENED: ['ASSIGNED', 'WORK_IN_PROGRESS', 'INSPECTION_REQUIRED'],
  REJECTED_WITH_REASON: ['UNDER_REVIEW', 'REOPENED'],
  CLOSED_AFTER_REVIEW: ['DISPUTED', 'REOPENED'],
  NEEDS_MORE_INFORMATION: ['SUBMITTED', 'UNDER_REVIEW', 'REJECTED_WITH_REASON'],

  // Backwards compatibility mappings for simple statuses
  Submitted: ['Reviewed', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'SUBMITTED', 'UNDER_REVIEW'],
  Reviewed: ['Assigned', 'In Progress', 'Resolved', 'Closed'],
  Assigned: ['In Progress', 'Resolved', 'Closed'],
  'In Progress': ['Resolved', 'Closed', 'REPAIR_REPORTED_COMPLETE', 'AWAITING_VERIFICATION'],
  Resolved: ['Closed', 'DISPUTED', 'REOPENED'],
  Closed: ['DISPUTED', 'REOPENED']
};

/**
 * Validates whether a transition from currentStatus to nextStatus is permissible for userRole.
 */
const validateTransition = ({ currentStatus, nextStatus, userRole, rejectionReason, hasClosureEvidence }) => {
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  
  if (!allowedNext.includes(nextStatus) && currentStatus !== nextStatus) {
    return {
      allowed: false,
      message: `Invalid state transition from '${currentStatus}' to '${nextStatus}'. Permitted transitions: ${allowedNext.join(', ')}`
    };
  }

  // Role permissions
  if (nextStatus === 'REJECTED_WITH_REASON') {
    if (userRole !== 'engineer' && userRole !== 'administrator') {
      return { allowed: false, message: 'Only an authorized municipal engineer or administrator can reject a complaint.' };
    }
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      return { allowed: false, message: 'Official rejection requires a recorded reason explaining the determination.' };
    }
  }

  if (nextStatus === 'VERIFIED_RESOLVED') {
    if (userRole === 'field_worker') {
      return { allowed: false, message: 'Field workers cannot independently mark their own repair work as independently verified.' };
    }
    if (userRole !== 'engineer' && userRole !== 'administrator') {
      return { allowed: false, message: 'Only an authorized municipal engineer or administrator can sign off a complaint as Verified Resolved.' };
    }
    if (hasClosureEvidence === false) {
      return { allowed: false, message: 'Verification requires verified closure evidence (before and after condition records).' };
    }
  }

  if (nextStatus === 'DISPUTED') {
    // Citizens and reporters can dispute
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      return { allowed: false, message: 'Disputing a closure decision requires providing specific feedback or reasons why the issue persists.' };
    }
  }

  return { allowed: true };
};

module.exports = { validateTransition, VALID_TRANSITIONS };
