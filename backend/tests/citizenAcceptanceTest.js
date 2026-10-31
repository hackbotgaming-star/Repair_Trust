const assert = require('assert');

async function runAcceptanceTest() {
  console.log('--- STARTING CITIZEN ROLE ACCEPTANCE TEST ---');
  const baseUrl = 'http://127.0.0.1:5000/api';

  // 1. Citizen Authentication
  console.log('1. Authenticating as Citizen...');
  const authRes = await fetch(`${baseUrl}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'citizen' })
  });
  const authData = await authRes.json();
  assert.strictEqual(authData.success, true);
  const token = authData.token;
  console.log(`   Logged in as: ${authData.user.name} (${authData.user.email})`);

  // 2. Submit Complaint with Photo Buffer & Geolocation
  console.log('2. Submitting complaint with photo evidence & map coordinates...');
  // Create a genuine JPEG buffer with FF D8 FF header
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const dummyPayload = Buffer.from('CITIZEN_PHOTO_PAYLOAD_' + Date.now());
  const photoBuffer = Buffer.concat([jpegHeader, dummyPayload]);

  const boundary = '----WebKitFormBoundaryAcceptance' + Date.now();
  let bodyBuffer = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nPothole / Damaged Road\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nLarge 20cm pothole opened near 8th Main crossing posing severe vehicle hazard\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="street"\r\n\r\n8th Main Commercial Road\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="ward"\r\n\r\nWard 4 (Central)\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="lat"\r\n\r\n12.9750\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="lng"\r\n\r\n77.5980\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="severity"\r\n\r\nHigh\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="road_pothole.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    photoBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const submitRes = await fetch(`${baseUrl}/v1/complaints`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: bodyBuffer
  });
  const submitData = await submitRes.json();
  assert.strictEqual(submitData.success, true);
  const complaintId = submitData.data.complaintId;
  console.log(`   Complaint registered with ID: ${complaintId}`);
  console.log(`   Screening Outcome: ${submitData.evidenceScreening.status}`);
  console.log(`   SHA-256 Hash: ${submitData.evidenceScreening.sha256Hash.slice(0, 32)}...`);
  console.log(`   Magic bytes validated: ${submitData.evidenceScreening.magicBytesValidated}`);

  // 3. Verify in My Complaints
  console.log('3. Checking My Complaints for authenticated citizen...');
  const myRes = await fetch(`${baseUrl}/v1/complaints?myComplaints=true`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const myData = await myRes.json();
  assert.strictEqual(myData.success, true);
  const found = myData.data.some((c) => c.complaintId === complaintId);
  assert.strictEqual(found, true, 'Complaint should appear in My Complaints');
  console.log(`   Found in My Complaints! Total items: ${myData.data.length}`);

  // 4. Test Duplicate Photo Fraud Detection (submitting identical photo bytes)
  console.log('4. Testing Duplicate Detection by submitting identical photo...');
  let dupBuffer = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nGarbage Blockage\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nAnother issue trying to reuse identical photo\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="street"\r\n\r\n8th Main Commercial Road\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="ward"\r\n\r\nWard 4 (Central)\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="road_pothole_copy.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    photoBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const dupRes = await fetch(`${baseUrl}/v1/complaints`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: dupBuffer
  });
  const dupData = await dupRes.json();
  if (!dupData.success) {
    console.error('dupData error:', dupData);
  }
  assert.strictEqual(dupData.success, true);
  console.log(`   Duplicate Submission ID: ${dupData.data.complaintId}`);
  console.log(`   Duplicate Screening Status: ${dupData.evidenceScreening.status}`);
  assert.strictEqual(dupData.evidenceScreening.status, 'Suspicious—manual review required');
  assert.strictEqual(dupData.evidenceScreening.duplicateOfComplaintId, complaintId);
  console.log(`   Duplicate correctly detected! Flagged duplicate of: ${dupData.evidenceScreening.duplicateOfComplaintId}`);

  // 5. Reopen Complaint with Reason & Follow-up Recurrence
  console.log('5. Reopening original complaint with new failure report...');
  const reopenRes = await fetch(`${baseUrl}/v1/complaints/${complaintId}/reopen`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason: 'Pothole patch disintegrated after heavy morning rain. Void widened to 35cm.',
      notes: 'Loose gravel washed into curb drain'
    })
  });
  const reopenData = await reopenRes.json();
  assert.strictEqual(reopenData.success, true);
  assert.strictEqual(reopenData.complaint.status, 'REOPENED');
  console.log(`   Original complaint status: ${reopenData.complaint.status}`);
  console.log(`   Generated linked recurrence: ${reopenData.followUpComplaint.complaintId}`);
  assert.strictEqual(reopenData.followUpComplaint.recurrenceOf, complaintId);

  // 6. Check Chained Event Ledger for Cryptographic Integrity
  console.log('6. Verifying cryptographic event chain for reopened complaint...');
  const eventRes = await fetch(`${baseUrl}/v1/complaints/${complaintId}/events`);
  const eventData = await eventRes.json();
  assert.strictEqual(eventData.success, true);
  assert.strictEqual(eventData.chainIntegrity.valid, true);
  console.log(`   Chain integrity: VALID (${eventData.events.length} chained blocks)`);

  console.log('\n✅ ALL CITIZEN ROLE ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!');
}

runAcceptanceTest().catch((err) => {
  console.error('❌ Acceptance Test Failed:', err);
  process.exit(1);
});
