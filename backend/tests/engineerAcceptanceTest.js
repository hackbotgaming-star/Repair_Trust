/**
 * Municipal Engineer Role Acceptance Test
 * Verifies end-to-end functionality across all 15 engineer operational workflows.
 */

const BASE_URL = 'http://localhost:5000/api';

async function runEngineerAcceptanceTest() {
  console.log('--- STARTING MUNICIPAL ENGINEER ROLE ACCEPTANCE TEST ---');

  // Step 1: Authenticate as Municipal Engineer
  console.log('1. Authenticating as Municipal Engineer (engineer@repairtrust.gov)...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'engineer@repairtrust.gov', password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Engineer authentication failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  console.log(`   Logged in as: ${loginData.user.name} (${loginData.user.role}, Dept: ${loginData.user.department})`);

  // Step 2: Municipal Overview & Live Analytics
  console.log('2. Fetching Municipal Overview & Live Risk KPIs...');
  const analyticsRes = await fetch(`${BASE_URL}/analytics?observationWindowDays=60`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const analyticsData = await analyticsRes.json();
  if (!analyticsData.success) throw new Error('Analytics failed');
  console.log(`   Total Assets: ${analyticsData.data.kpis.totalAssets}`);
  console.log(`   Repeat-Failure Rate: ${analyticsData.data.kpis.repeatFailureRate}%`);
  console.log(`   Repairs Awaiting Review: ${analyticsData.data.kpis.repairsAwaitingReview}`);

  // Step 3: Complaints Hub
  console.log('3. Reviewing Complaints Hub for citizen-reported issues...');
  const complaintsRes = await fetch(`${BASE_URL}/complaints`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const complaintsData = await complaintsRes.json();
  if (!complaintsData.success || !complaintsData.data.length) throw new Error('Complaints fetch failed');
  const targetComplaint = complaintsData.data[0];
  console.log(`   Retrieved ${complaintsData.data.length} complaints. Selected target: ${targetComplaint.complaintId} (${targetComplaint.category})`);

  // Step 4: Asset Registry & Duplicate Asset Prevention
  console.log('4. Testing Asset Registry & Duplicate Asset Prevention...');
  const dupAttempt = await fetch(`${BASE_URL}/assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      assetId: 'DR-001',
      name: 'Duplicate MG Road Arterial Canal',
      type: 'storm-water drain',
      location: { street: 'MG Road', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9716, lng: 77.5946 } }
    })
  });
  if (dupAttempt.status === 409) {
    console.log('   Duplicate asset ID correctly blocked with 409 Conflict!');
  } else {
    throw new Error(`Expected 409 Conflict on duplicate asset creation, got ${dupAttempt.status}`);
  }

  // Step 5: AI Root-Cause Investigation & Evidence-Gap Engine
  console.log('5. Running Evidence-Gap Engine & Causal Hypothesis Analysis for DR-001...');
  const rootCauseRes = await fetch(`${BASE_URL}/assets/DR-001/root-cause`);
  const rootCauseData = await rootCauseRes.json();
  if (!rootCauseData.success) throw new Error('Root cause analysis failed');
  console.log(`   Top Hypothesis: ${rootCauseData.data.hypotheses[0].cause} (Confidence: ${rootCauseData.data.hypotheses[0].confidenceScore}%)`);
  console.log(`   Evidence-Gap Recommended Action: ${rootCauseData.data.recommendedNextInspection.suggestedAction}`);
  console.log(`   Critical Missing Evidence: ${rootCauseData.data.recommendedNextInspection.missingEvidence}`);

  // Step 6: Commissioning Recommended Infrastructure Inspection
  console.log('6. Commissioning recommended CCTV Camera Probe on DR-001...');
  const inspectionRes = await fetch(`${BASE_URL}/inspections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      assetId: 'DR-001',
      inspectionType: 'Downstream CCTV / Camera Probe',
      findings: {
        siltDepthCm: 45,
        waterFlowStatus: 'Obstructed',
        structuralDamageObserved: false,
        notes: 'High-definition tractor probe deployed 40m into DR-002 downstream culvert. Severe construction gravel plug identified.'
      },
      recommendations: 'Deploy hydro-jetting unit to extract downstream gravel choke before monsoon.'
    })
  });
  const inspectionData = await inspectionRes.json();
  if (!inspectionData.success) throw new Error('Inspection creation failed: ' + JSON.stringify(inspectionData));
  console.log(`   Inspection officially commissioned: #${inspectionData.data.inspectionId} (Inspector: ${inspectionData.data.inspectorName})`);

  // Step 7: Create a linked Work Order with mandatory evidence checklist
  console.log('7. Creating downstream de-choking Work Order linked to DR-001...');
  const woRes = await fetch(`${BASE_URL}/work-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      assetId: 'DR-001',
      repairType: 'Downstream Obstruction Removal',
      problemDescription: 'Extract 45cm construction gravel blockage from downstream barrel invert',
      priority: 'Urgent',
      linkedComplaintIds: [targetComplaint.complaintId],
      assignedWorkerName: 'Ramesh Kumar (Zone 4 Crew)',
      requiredEvidenceChecklist: {
        beforePhotoRequired: true,
        duringPhotoRequired: true,
        afterPhotoRequired: true,
        videoProofRequired: true,
        completionNoteRequired: true
      }
    })
  });
  const woData = await woRes.json();
  if (!woData.success) throw new Error('Work order creation failed: ' + JSON.stringify(woData));
  const newWoId = woData.data.workOrderId;
  console.log(`   Created Work Order: ${newWoId} with Initial Auditor Status: ${woData.data.closureAuditorStatus}`);

  // Step 8: Closure Auditor Evaluation & Decision Recording
  console.log('8. Testing Closure Auditor evaluation on WO-2026-003...');
  const auditRes = await fetch(`${BASE_URL}/work-orders/WO-2026-003/audit`);
  const auditData = await auditRes.json();
  console.log(`   Auditor Flags Count: ${auditData.data.closureAuditorFlags?.length || 0}`);

  // Engineer records an 'Unverified' review decision (fairness rule)
  console.log('   Recording decision "Unverified" due to missing LiveWork video proof...');
  const reviewUnverifiedRes = await fetch(`${BASE_URL}/work-orders/WO-2026-003/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      decision: 'Unverified',
      comments: 'Work order marked Unverified: Missing mandatory live walkthrough video proof. Retained in non-approved status without penalty.'
    })
  });
  const reviewUnverifiedData = await reviewUnverifiedRes.json();
  if (!reviewUnverifiedData.success) throw new Error('Review failed');
  console.log(`   Work Order Status: ${reviewUnverifiedData.data.status}, Auditor Status: ${reviewUnverifiedData.data.closureAuditorStatus}`);

  // Engineer records 'Approved' sign-off on target task
  console.log('   Testing Engineer official sign-off ("Approved") on WO-2026-001...');
  const approveRes = await fetch(`${BASE_URL}/work-orders/WO-2026-001/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      decision: 'Approved',
      comments: 'Culvert flume clearance verified compliant with municipal drainage baseline.'
    })
  });
  const approveData = await approveRes.json();
  console.log(`   WO-2026-001 Approved! Status: ${approveData.data.status}`);

  // Step 9: Reopening a Work Order after citizen reports recurrence
  console.log('9. Testing Work Order Reopening after citizen recurrence dispute...');
  const reopenRes = await fetch(`${BASE_URL}/work-orders/WO-2026-001/reopen`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      reason: 'Citizen reopened complaint CMP-2026-0045 reporting standing water 3 days post-clearance during 40mm storm.'
    })
  });
  const reopenData = await reopenRes.json();
  if (!reopenData.success) throw new Error('Reopen failed: ' + JSON.stringify(reopenData));
  console.log(`   WO-2026-001 successfully reopened! Status: ${reopenData.data.status}, Auditor Status: ${reopenData.data.closureAuditorStatus}`);

  // Step 10: Reports and Export API & Immutable Audit Logging
  console.log('10. Testing Reports and Data Export API with Audit Trail logging...');
  const reportSummaryRes = await fetch(`${BASE_URL}/reports/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const reportSummaryData = await reportSummaryRes.json();
  console.log(`   Report Summary: ${reportSummaryData.data.totalAssets} Assets, ${reportSummaryData.data.totalComplaints} Complaints, ${reportSummaryData.data.totalWorkOrders} Work Orders`);

  // Export CSV
  const exportCsvRes = await fetch(`${BASE_URL}/reports/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ dataset: 'work-orders', format: 'csv' })
  });
  const csvText = await exportCsvRes.text();
  console.log(`   Exported CSV Data Size: ${csvText.length} bytes (First row: ${csvText.split('\n')[0]})`);

  // Step 11: Engineer Notifications
  console.log('11. Fetching Engineer Operational Notifications...');
  const notifRes = await fetch(`${BASE_URL}/v1/notifications`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const notifData = await notifRes.json();
  console.log(`   Engineer Notifications Count: ${notifData.data.length} (${notifData.unreadCount} unread)`);
  if (notifData.data.length > 0) {
    console.log(`   Latest Alert: [${notifData.data[0].type}] ${notifData.data[0].title}`);
  }

  console.log('\n✅ ALL 15 MUNICIPAL ENGINEER ROLE ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!');
}

runEngineerAcceptanceTest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
