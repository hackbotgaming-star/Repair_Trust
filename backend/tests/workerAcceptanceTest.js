const assert = require('assert');

const baseUrl = 'http://localhost:5000/api';

async function runWorkerAcceptanceTest() {
  console.log('--- STARTING FIELD WORKER ROLE ACCEPTANCE TEST ---');

  // 1. Authenticate as Field Worker (Ramesh Kumar)
  console.log('1. Authenticating as Field Worker (worker@repairtrust.gov)...');
  const workerLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'worker@repairtrust.gov', password: 'password123' })
  });
  const workerLoginData = await workerLoginRes.json();
  assert.strictEqual(workerLoginData.success, true, 'Worker login should succeed');
  const workerToken = workerLoginData.token;
  const workerUser = workerLoginData.user;
  console.log(`   Logged in as: ${workerUser.name} (${workerUser.role}, Badge: ${workerUser.badgeNumber || 'FW-108'})`);

  // 2. Fetch Assigned Tasks
  console.log('2. Fetching tasks assigned to authenticated field worker...');
  const tasksRes = await fetch(`${baseUrl}/work-orders?myTasks=true`, {
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  const tasksData = await tasksRes.json();
  assert.strictEqual(tasksData.success, true);
  console.log(`   Retrieved ${tasksData.data.length} assigned work orders.`);
  const task = tasksData.data.find((t) => t.workOrderId === 'WO-2026-003') || tasksData.data[0];
  assert.ok(task, 'Worker must have an assigned task');
  console.log(`   Operating on target task: ${task.workOrderId} (Asset: ${task.assetId}, Status: ${task.status})`);

  // 3. Worker Accepts & Starts Task (Status: Assigned -> In Progress)
  console.log('3. Accepting & starting task on site (transition to In Progress)...');
  const startRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${workerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'In Progress', note: 'Worker crew arrived on site and started operations' })
  });
  const startData = await startRes.json();
  assert.strictEqual(startData.success, true);
  assert.strictEqual(startData.data.status, 'In Progress');
  console.log(`   Task ${task.workOrderId} is now In Progress.`);

  // 4. Test Pause Task With Reason
  console.log('4. Testing task pause with reason...');
  const pauseRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${workerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'Paused',
      pauseReason: 'Torrential downpour causing flash flooding; paused for crew electrical safety'
    })
  });
  const pauseData = await pauseRes.json();
  assert.strictEqual(pauseData.success, true);
  assert.strictEqual(pauseData.data.status, 'Paused');
  assert.strictEqual(pauseData.data.pauseReason.includes('Torrential downpour'), true);
  console.log(`   Task correctly paused with recorded reason: "${pauseData.data.pauseReason}"`);

  // Resume task
  const resumeRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${workerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'In Progress', note: 'Rain subsided; resuming operations' })
  });
  const resumeData = await resumeRes.json();
  assert.strictEqual(resumeData.data.status, 'In Progress');
  console.log(`   Task resumed back to In Progress.`);

  // 5. Worker Site Check-in
  console.log('5. Recording worker site check-in with GPS proximity...');
  const checkInRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}/check-in`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${workerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      coordinates: { lat: 12.6623, lng: 77.4504 },
      isManualEntry: false,
      notes: 'Arrival at DR-001 box drain culvert',
      type: 'check-in'
    })
  });
  const checkInData = await checkInRes.json();
  assert.strictEqual(checkInData.success, true);
  assert.ok(checkInData.checkIn, 'CheckIn record created');
  console.log(`   Check-in recorded: ${checkInData.checkIn.type} at ${checkInData.checkIn.timestamp}`);

  // 6. Submit Before, During, and After Photo Evidence
  console.log('6. Submitting Before, During, and After Evidence Photos...');
  const stages = ['before', 'during', 'after'];
  for (const stg of stages) {
    const boundary = `----WebKitFormBoundary${Date.now()}`;
    const sampleBytes = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
      0x00, 0x60, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, Math.floor(Math.random() * 255), 0xff, 0xd9
    ]);

    const formBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="stage"\r\n\r\n${stg}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${stg.toUpperCase()} repair evidence for ${task.workOrderId}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${stg}_evidence.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
      sampleBytes,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const evRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}/evidence`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${workerToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formBody
    });

    const evData = await evRes.json();
    assert.strictEqual(evData.success, true, `Evidence upload for stage ${stg} must succeed`);
    console.log(`   Attached ${stg} evidence: ${evData.addedItems?.[0]?.url || 'Uploaded'}`);
  }

  // 7. Complete Materials & Completion Notes
  console.log('7. Logging materials consumed and crew work notes...');
  const matRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}/materials`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${workerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      materialsUsed: [
        { item: 'Vacuum Gully Sucker Unit', quantity: '1 Shift' },
        { item: 'High-Pressure Jetting Hose (140m)', quantity: '1 Unit' },
        { item: 'Rapid-setting Hydraulic Mortar', quantity: '2 Bags' }
      ],
      completionNotes: 'Completed comprehensive de-silting of 140m box drain run. Extracted 4.2 cubic meters of silt and plastic gravel. Performed full downstream hydraulic flow test.'
    })
  });
  const matData = await matRes.json();
  assert.strictEqual(matData.success, true);
  console.log(`   Logged ${matData.data.materialsUsed.length} materials and detailed work notes.`);

  // 8. Prevent Worker From Self-Verifying (Unauthorized Approval)
  console.log('8. Verifying workers cannot self-verify/approve their own work...');
  const selfApproveRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${workerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'Approved' })
  });
  assert.strictEqual(selfApproveRes.status, 403, 'Worker self-approval must be rejected with 403');
  console.log('   Self-verification correctly blocked by server RBAC rules!');

  // 9. Worker Submits Work Order for Engineer Review
  console.log('9. Worker submitting completed work order for engineering review...');
  const submitRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${workerToken}` }
  });
  const submitData = await submitRes.json();
  assert.strictEqual(submitData.success, true);
  assert.strictEqual(submitData.data.status, 'Submitted for Review');
  console.log(`   Work order submitted! Status: ${submitData.data.status}, Auditor Status: ${submitData.data.closureAuditorStatus}`);

  // 10. Engineer Retrieves Saved Evidence from Database
  console.log('10. Authenticating as Municipal Engineer to inspect submitted evidence in database...');
  const engLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'engineer@repairtrust.gov', password: 'password123' })
  });
  const engLogin = await engLoginRes.json();
  assert.strictEqual(engLogin.success, true);
  const engToken = engLogin.token;

  const engInspectRes = await fetch(`${baseUrl}/work-orders/${task.workOrderId}`, {
    headers: { Authorization: `Bearer ${engToken}` }
  });
  const engInspectData = await engInspectRes.json();
  assert.strictEqual(engInspectData.success, true);
  const retrieved = engInspectData.data;

  assert.strictEqual(retrieved.status, 'Submitted for Review');
  assert.ok(retrieved.beforeEvidence.length > 0, 'Engineer must retrieve before evidence');
  assert.ok(retrieved.duringEvidence.length > 0, 'Engineer must retrieve during evidence');
  assert.ok(retrieved.afterEvidence.length > 0, 'Engineer must retrieve after evidence');
  assert.ok(retrieved.materialsUsed.length >= 3, 'Engineer must retrieve materials used');
  assert.ok(retrieved.completionNotes.length > 0, 'Engineer must retrieve completion notes');
  assert.ok(retrieved.checkIns.length > 0, 'Engineer must retrieve worker check-in log');

  console.log(`   Engineer verified retrieved database record for ${retrieved.workOrderId}:`);
  console.log(`   - Before Evidence Count: ${retrieved.beforeEvidence.length}`);
  console.log(`   - During Evidence Count: ${retrieved.duringEvidence.length}`);
  console.log(`   - After Evidence Count: ${retrieved.afterEvidence.length}`);
  console.log(`   - Materials Logged: ${retrieved.materialsUsed.map((m) => m.item).join(', ')}`);
  console.log(`   - Check-Ins Logged: ${retrieved.checkIns.length}`);
  console.log(`   - Closure Auditor Status: ${retrieved.closureAuditorStatus}`);

  console.log('\n✅ ALL FIELD WORKER ROLE ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!');
}

runWorkerAcceptanceTest().catch((err) => {
  console.error('\n❌ WORKER ACCEPTANCE TEST FAILED:', err);
  process.exit(1);
});
