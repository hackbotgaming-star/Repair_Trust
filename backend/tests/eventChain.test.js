const test = require('node:test');
const assert = require('node:assert');
const ComplaintEvent = require('../src/models/ComplaintEvent');

test('ComplaintEvent computes deterministic SHA-256 chained hash', () => {
  const payload1 = {
    eventId: 'EVT-TEST-001',
    complaintId: 'CMP-TEST-999',
    eventType: 'COMPLAINT_CREATED',
    actorName: 'Amina Citizen',
    actorRole: 'citizen',
    changeSummary: 'Reported drain overflow',
    previousStatus: null,
    newStatus: 'SUBMITTED',
    timestamp: new Date('2026-10-30T10:00:00Z')
  };

  const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const hash1 = ComplaintEvent.computeEventHash(payload1, genesisHash);

  assert.strictEqual(typeof hash1, 'string');
  assert.strictEqual(hash1.length, 64);

  // Second event chained to first event's hash
  const payload2 = {
    eventId: 'EVT-TEST-002',
    complaintId: 'CMP-TEST-999',
    eventType: 'STATUS_CHANGED',
    actorName: 'Vikram Engineer',
    actorRole: 'engineer',
    changeSummary: 'Assigned to field squad',
    previousStatus: 'SUBMITTED',
    newStatus: 'ASSIGNED',
    timestamp: new Date('2026-10-30T11:00:00Z')
  };

  const hash2 = ComplaintEvent.computeEventHash(payload2, hash1);
  assert.strictEqual(hash2.length, 64);
  assert.notStrictEqual(hash1, hash2);

  // Tampering detection: Altering any field changes the hash
  const tamperedPayload = { ...payload1, changeSummary: 'Manipulated description by rogue actor' };
  const tamperedHash = ComplaintEvent.computeEventHash(tamperedPayload, genesisHash);
  assert.notStrictEqual(hash1, tamperedHash, 'Tampering must break the hash');
});
