const ComplaintEvent = require('../models/ComplaintEvent');

/**
 * Record an append-only event into the complaint's tamper-evident history chain.
 */
const recordEvent = async ({
  complaintId,
  eventType,
  actorId = 'system',
  actorName = 'System Automated',
  actorRole = 'system',
  changeSummary,
  previousStatus = null,
  newStatus = null,
  details = {}
}) => {
  // Find latest event for this complaint to get previous hash
  const latestEvent = await ComplaintEvent.findOne({ complaintId }).sort({ timestamp: -1 });
  const prevHash = latestEvent
    ? latestEvent.eventHash
    : '0000000000000000000000000000000000000000000000000000000000000000';

  const count = await ComplaintEvent.countDocuments();
  const eventId = `EVT-2026-${String(count + 1001).padStart(6, '0')}`;
  const timestamp = new Date();

  const hash = ComplaintEvent.computeEventHash(
    {
      eventId,
      complaintId,
      eventType,
      actorName,
      actorRole,
      changeSummary,
      previousStatus,
      newStatus,
      timestamp
    },
    prevHash
  );

  const event = new ComplaintEvent({
    eventId,
    complaintId,
    eventType,
    actorId,
    actorName,
    actorRole,
    changeSummary,
    previousStatus,
    newStatus,
    details,
    timestamp,
    previousEventHash: prevHash,
    eventHash: hash
  });

  await event.save();
  return event;
};

/**
 * Validates the cryptographic integrity of the entire event chain for a complaint.
 */
const verifyEventChain = async (complaintId) => {
  const events = await ComplaintEvent.find({ complaintId }).sort({ timestamp: 1 });
  if (events.length === 0) return { valid: true, count: 0, brokenAt: null };

  let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.previousEventHash !== expectedPrevHash) {
      return {
        valid: false,
        count: events.length,
        brokenAt: ev.eventId,
        reason: `Previous hash mismatch at index ${i}`
      };
    }

    const recomputedHash = ComplaintEvent.computeEventHash(
      {
        eventId: ev.eventId,
        complaintId: ev.complaintId,
        eventType: ev.eventType,
        actorName: ev.actorName,
        actorRole: ev.actorRole,
        changeSummary: ev.changeSummary,
        previousStatus: ev.previousStatus,
        newStatus: ev.newStatus,
        timestamp: ev.timestamp
      },
      expectedPrevHash
    );

    if (recomputedHash !== ev.eventHash) {
      return {
        valid: false,
        count: events.length,
        brokenAt: ev.eventId,
        reason: `Cryptographic payload checksum altered at index ${i}`
      };
    }

    expectedPrevHash = ev.eventHash;
  }

  return { valid: true, count: events.length, brokenAt: null };
};

module.exports = { recordEvent, verifyEventChain };
