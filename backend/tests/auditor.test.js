const test = require('node:test');
const assert = require('node:assert');
const { auditWorkOrder } = require('../src/services/auditorService');

test('Closure Auditor flags missing video proof and missing after evidence', async () => {
  const dummyWorkOrder = {
    workOrderId: 'WO-TEST-001',
    status: 'In Progress',
    requiredEvidenceChecklist: {
      beforePhotoRequired: true,
      duringPhotoRequired: true,
      afterPhotoRequired: true,
      videoProofRequired: true,
      completionNoteRequired: true
    },
    beforeEvidence: [],
    duringEvidence: [],
    afterEvidence: [],
    videoEvidence: [],
    completionNotes: ''
  };

  const result = await auditWorkOrder(dummyWorkOrder, null);
  assert.strictEqual(result.closureAuditorStatus, 'Incomplete');
  assert.strictEqual(result.isComplete, false);

  const flagCodes = result.closureAuditorFlags.map(f => f.code);
  assert.ok(flagCodes.includes('MISSING_BEFORE_EVIDENCE'));
  assert.ok(flagCodes.includes('MISSING_AFTER_EVIDENCE'));
  assert.ok(flagCodes.includes('MISSING_VIDEO_PROOF'));
  assert.ok(flagCodes.includes('MISSING_COMPLETION_NOTES'));
});

test('Closure Auditor recognizes complete evidence submission', async () => {
  const completeWorkOrder = {
    workOrderId: 'WO-TEST-002',
    status: 'Submitted for Review',
    requiredEvidenceChecklist: {
      beforePhotoRequired: true,
      duringPhotoRequired: false,
      afterPhotoRequired: true,
      videoProofRequired: true,
      completionNoteRequired: true
    },
    beforeEvidence: [{ url: 'https://example.com/before.jpg' }],
    afterEvidence: [{ url: 'https://example.com/after.jpg' }],
    videoEvidence: ['vid_dummy_id_123'],
    completionNotes: 'Cleaned invert and flushed line thoroughly with jetting unit.'
  };

  const result = await auditWorkOrder(completeWorkOrder, null);
  assert.strictEqual(result.isComplete, true);
  assert.strictEqual(result.closureAuditorStatus, 'Under Review');
});
