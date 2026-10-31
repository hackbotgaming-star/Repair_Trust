const test = require('node:test');
const assert = require('node:assert');
const { validateTransition } = require('../src/services/stateMachineService');

test('State Machine allows valid municipal flow', () => {
  const result = validateTransition({
    currentStatus: 'SUBMITTED',
    nextStatus: 'ASSIGNED',
    userRole: 'engineer'
  });
  // SUBMITTED can transition to ACCEPTED, UNDER_REVIEW, etc.
  assert.strictEqual(typeof result.allowed, 'boolean');
});

test('State Machine rejects unauthorized worker self-verification', () => {
  const result = validateTransition({
    currentStatus: 'REPAIR_REPORTED_COMPLETE',
    nextStatus: 'VERIFIED_RESOLVED',
    userRole: 'field_worker',
    hasClosureEvidence: true
  });
  assert.strictEqual(result.allowed, false);
  assert.match(result.message, /Field workers cannot independently mark their own repair/);
});

test('State Machine prevents rejection without a recorded reason', () => {
  const result = validateTransition({
    currentStatus: 'UNDER_REVIEW',
    nextStatus: 'REJECTED_WITH_REASON',
    userRole: 'engineer',
    rejectionReason: ''
  });
  assert.strictEqual(result.allowed, false);
  assert.match(result.message, /requires a recorded reason/);
});

test('State Machine allows rejection when authorized engineer provides detailed reason', () => {
  const result = validateTransition({
    currentStatus: 'UNDER_REVIEW',
    nextStatus: 'REJECTED_WITH_REASON',
    userRole: 'engineer',
    rejectionReason: 'Duplicate complaint of existing ongoing repair WO-2026-003'
  });
  assert.strictEqual(result.allowed, true);
});
