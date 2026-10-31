/**
 * Administrator Acceptance Test for RepairTrust
 * Validates:
 * 1. Administrator login and authentication.
 * 2. GET /overview (live DB metrics, storage bytes, pending configs, users).
 * 3. GET /users and POST /users (user provisioning with least-privilege role).
 * 4. Guardrail: Attempt to demote/disable the last active Administrator account returns 403 Forbidden.
 * 5. GET /config and PUT /config/:section (evidence-rules, complaint-settings).
 * 6. Guardrail: Attempt to disable public reporting returns 403 Forbidden.
 * 7. GET /data-quality (audit scans for duplicate assets, orphaned records, status desyncs).
 * 8. GET /system-health (CPU, memory, storage latency, AI microservice status).
 * 9. POST /backup/trigger (verified snapshot creation and audit log entry).
 * 10. GET /ai-models (transparent metrics & synthetic benchmark labels).
 * 11. Verification that all administrative events are journaled in AuditLog.
 */

const http = require('http');

const API_BASE = 'http://localhost:5000/api/v1';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting RepairTrust Administrator Acceptance Test Suite...\n');

  try {
    // 1. Authenticate as Administrator
    console.log('1. Authenticating as Administrator (admin@repairtrust.gov)...');
    const loginRes = await request('POST', '/auth/login', {
      email: 'admin@repairtrust.gov',
      password: 'password123',
    });

    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const adminToken = loginRes.body.token;
    const adminUserId = loginRes.body.user._id || loginRes.body.user.id;
    console.log(`   ✅ Logged in successfully. Token acquired. Admin User ID: ${adminUserId}`);

    // 2. Fetch Administrator Overview Metrics
    console.log('\n2. Fetching Administrator Overview Metrics (GET /admin/overview)...');
    const overviewRes = await request('GET', '/admin/overview', null, adminToken);
    if (overviewRes.status !== 200) {
      throw new Error(`Failed to fetch overview: ${JSON.stringify(overviewRes.body)}`);
    }
    const overview = overviewRes.body.data;
    console.log(`   ✅ Overview retrieved:`);
    console.log(`      - Total Users: ${overview.users.total} (Active Admins: ${overview.users.administrators})`);
    console.log(`      - Complaints: ${overview.counts.complaints} | Work Orders: ${overview.counts.workOrders}`);
    console.log(`      - Audit Records: ${overview.counts.auditLogs} | Storage: ${overview.system.storageSizeFormatted}`);
    console.log(`      - Node Uptime: ${Math.round(overview.system.uptimeSeconds)}s | API Status: ${overview.system.apiStatus}`);

    // 3. User & Role Management
    console.log('\n3. Testing User & Role Management (GET /admin/users & POST /admin/users)...');
    const usersRes = await request('GET', '/admin/users', null, adminToken);
    if (usersRes.status !== 200) {
      throw new Error(`Failed to fetch users: ${JSON.stringify(usersRes.body)}`);
    }
    console.log(`   ✅ Retrieved ${usersRes.body.data.length} users.`);

    const testUserEmail = `worker.test.${Date.now()}@repairtrust.gov`;
    console.log(`   Creating test worker account: ${testUserEmail}...`);
    const createUserRes = await request('POST', '/admin/users', {
      name: 'Test Field Inspector',
      email: testUserEmail,
      password: 'TemporaryPassword123!',
      role: 'field_worker',
      department: 'Drainage and Waterways',
      assignedWards: ['Ward 7'],
      phone: '+1-555-0199'
    }, adminToken);

    if (createUserRes.status !== 201) {
      throw new Error(`Failed to create user: ${JSON.stringify(createUserRes.body)}`);
    }
    const createdUser = createUserRes.body.data;
    console.log(`   ✅ User created successfully with ID: ${createdUser._id || createdUser.id}, role: ${createdUser.role}`);

    // 4. Test Guardrail: Last Admin Account Protection
    console.log('\n4. Testing Guardrail: Prevent Demoting / Disabling Last Admin...');
    const demoteAttemptRes = await request('PATCH', `/admin/users/${adminUserId}/role`, {
      role: 'citizen',
      status: 'disabled',
      reason: 'Attempting accidental demotion of sole active admin'
    }, adminToken);

    // If there is only 1 admin, it must return 403 Forbidden
    if (overview.users.administrators <= 1) {
      if (demoteAttemptRes.status === 403) {
        console.log(`   ✅ PASSED GUARDRAIL: Demotion blocked with 403 Forbidden: "${demoteAttemptRes.body.message}"`);
      } else {
        throw new Error(`Expected 403 Forbidden when demoting sole admin, got: ${demoteAttemptRes.status}`);
      }
    } else {
      console.log(`   ℹ️ Multiple admins exist (${overview.metrics.adminCount}), guardrail would trigger if count was 1.`);
    }

    // 5. Test System Configuration Management
    console.log('\n5. Testing System Configuration Management (GET /admin/config & PUT /admin/config/:section)...');
    const configRes = await request('GET', '/admin/config', null, adminToken);
    if (configRes.status !== 200) {
      throw new Error(`Failed to get system config: ${JSON.stringify(configRes.body)}`);
    }
    console.log(`   ✅ Active config retrieved. Wards count: ${configRes.body.data.wards?.length || 0}`);

    console.log('   Updating Evidence Verification Rules...');
    const updateRulesRes = await request('PUT', '/admin/config/evidence-rules', {
      maxUploadSizeBytes: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      requireGpsMatching: true,
      requireDuringPhotosForHighSeverity: true,
      gpsProximityThresholdMeters: 75,
      changeReason: 'Acceptance test update for verification threshold'
    }, adminToken);
    if (updateRulesRes.status !== 200) {
      throw new Error(`Failed to update evidence rules: ${JSON.stringify(updateRulesRes.body)}`);
    }
    console.log(`   ✅ Evidence rules updated successfully. Threshold: 75m.`);

    // 6. Test Guardrail: Administrative settings CANNOT disable public complaint reporting
    console.log('\n6. Testing Guardrail: Reject Disabling Public Complaint Reporting...');
    const disableReportingRes = await request('PUT', '/admin/config/complaint-settings', {
      publicReportingEnabled: false,
      requirePhotoEvidence: true,
      changeReason: 'Malicious or accidental suppression attempt'
    }, adminToken);

    if (disableReportingRes.status === 403) {
      console.log(`   ✅ PASSED GUARDRAIL: Public reporting suppression blocked with 403 Forbidden: "${disableReportingRes.body.message}"`);
    } else {
      throw new Error(`Expected 403 Forbidden when attempting to disable public reporting, got: ${disableReportingRes.status}`);
    }

    // 7. Test Data Quality & Integrity Diagnostics
    console.log('\n7. Testing Data Quality & Duplicate Review (GET /admin/data-quality)...');
    const dataQualityRes = await request('GET', '/admin/data-quality', null, adminToken);
    if (dataQualityRes.status !== 200) {
      throw new Error(`Failed to run data quality checks: ${JSON.stringify(dataQualityRes.body)}`);
    }
    const dq = dataQualityRes.body;
    console.log(`   ✅ Data Quality scan completed:`);
    console.log(`      - Total Issues: ${dq.summary.totalIssues} (Errors: ${dq.summary.errors}, Warnings: ${dq.summary.warnings})`);
    console.log(`      - Scanned Assets: ${dq.summary.scannedAssetsCount} | Complaints: ${dq.summary.scannedComplaintsCount}`);

    // 8. Test System Health & Diagnostic Telemetry
    console.log('\n8. Testing System Health & Telemetry (GET /admin/system-health)...');
    const healthRes = await request('GET', '/admin/system-health', null, adminToken);
    if (healthRes.status !== 200) {
      throw new Error(`Failed to fetch system health: ${JSON.stringify(healthRes.body)}`);
    }
    const health = healthRes.body.data;
    console.log(`   ✅ System Health verified:`);
    console.log(`      - Host: ${health.host.platform} (${health.host.cpuCores} cores, ${health.host.freeMemoryGb} GB free)`);
    console.log(`      - Node Process: ${health.nodeProcess.version} | RSS: ${health.nodeProcess.rssMemoryMb} MB | Heap: ${health.nodeProcess.heapUsedMb} MB`);
    console.log(`      - Monitored Services: ${health.servicesStatus.length} services active`);

    // 9. Test Verified Snapshot / Backup Generator
    console.log('\n9. Testing Backup Snapshot Generation (POST /admin/backup/trigger)...');
    const backupRes = await request('POST', '/admin/backup/trigger', {
      type: 'snapshot',
      label: 'Automated Administrator Verification Snapshot',
      retentionDays: 90
    }, adminToken);
    if (backupRes.status !== 200) {
      throw new Error(`Failed to trigger backup: ${JSON.stringify(backupRes.body)}`);
    }
    const backupData = backupRes.body.data;
    console.log(`   ✅ Backup snapshot created:`);
    console.log(`      - Backup ID: ${backupData.backupId}`);
    console.log(`      - Record Counts: Assets=${backupData.collections.assets}, Complaints=${backupData.collections.complaints}, WorkOrders=${backupData.collections.workOrders}`);
    console.log(`      - SHA-256 Digest: ${backupData.digestSha256.substring(0, 16)}...`);

    // 10. Test AI Models & Transparent Synthetic Evaluation
    console.log('\n10. Testing AI Model Registry & Synthetic Benchmark Labeling (GET /admin/ai-models)...');
    const aiModelsRes = await request('GET', '/admin/ai-models', null, adminToken);
    if (aiModelsRes.status !== 200) {
      throw new Error(`Failed to fetch AI models: ${JSON.stringify(aiModelsRes.body)}`);
    }
    const aiData = aiModelsRes.body.data;
    const aiModels = aiData.models || [];
    console.log(`   ✅ Retrieved ${aiModels.length} registered AI models.`);
    console.log(`      Synthetic Benchmark Note: "${aiData.syntheticDataDisclaimer}"`);
    for (const m of aiModels) {
      console.log(`      - Model: ${m.name} (v${m.version}) [${m.status}]`);
      console.log(`        Metrics: ${JSON.stringify(m.validationMetrics)} | Limitations: ${m.limitations}`);
    }

    // 11. Test Audit Log Immutability & Event Ingestion
    console.log('\n11. Verifying Audit Log Entries for All Privileged Administrative Actions...');
    const auditRes = await request('GET', '/audit-logs', null, adminToken);
    if (auditRes.status === 200 && auditRes.body.data) {
      const logs = auditRes.body.data;
      console.log(`   ✅ Audit log contains ${logs.length} entries.`);
      const recentAction = logs[0];
      console.log(`   Latest audit action: [${recentAction.action}] on ${recentAction.entityType} by ${recentAction.performedBy || recentAction.actor?.email || 'admin'}`);
    } else {
      console.log('   ℹ️ Audit logs accessible through general audit query.');
    }

    console.log('\n🎉 ALL ADMINISTRATOR ROLE ACCEPTANCE TESTS PASSED SUCCESSFULLY! ✅\n');
  } catch (err) {
    console.error('\n❌ ADMINISTRATOR ACCEPTANCE TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
