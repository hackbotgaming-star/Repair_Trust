# RepairTrust — Trust Repairs. Find Real Fixes.

> **Public-First Municipal Infrastructure Accountability, Repair Verification, and Decision-Support Platform**

RepairTrust solves the fundamental disconnect in municipal infrastructure maintenance: **a work order marked "completed" does not prove that a repair was performed correctly or that the underlying hydraulic failure was resolved.** 

Repeated drain cleaning may fail to address a deeper blockage, downstream pipe constriction, or insufficient drainage capacity. RepairTrust builds an evidence-based provenance graph connecting citizen reports, photographic and video evidence, cryptographic screening, deterministic Closure Auditor verifications, and AI-assisted root-cause investigations.

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────────────────────┐
                               │                    REPAIRTRUST CLIENT                    │
                               │           React 18 + TypeScript + Tailwind CSS           │
                               │   Three.js/R3F 3D Twin • Leaflet GIS • Recharts Analytics│
                               └────────────────────────────┬─────────────────────────────┘
                                                            │ REST (Port 5173 -> 5000)
                                                            ▼
                               ┌──────────────────────────────────────────────────────────┐
                               │                EXPRESS.JS BACKEND SERVER                 │
                               │      /api/v1/ REST API • JWT RBAC • Multer & Sharp       │
                               │   Evidence Screening • Tamper-Evident SHA-256 Ledger     │
                               │   Deterministic Closure Auditor • Evidence-Gap Engine    │
                               │         Asset Memory Graph Provenance Builder            │
                               └──────────────┬────────────────────────────┬──────────────┘
                                              │                            │
                 Internal Mongoose Connector  │                            │ HTTP Microservice API
                                              ▼                            ▼
                      ┌───────────────────────────────┐  ┌────────────────────────────────────┐
                      │      MONGODB / MONGO-MEMORY   │  │       FASTAPI AI MICROSERVICE      │
                      │  22 Assets • Audit Logs • WOs │  │   Scikit-Learn Random Forest (Risk)│
                      │ Complaints • Video References │  │   Isolation Forest (Anomalies)     │
                      │ Chained Event Blocks • Screen │  │   Port 8000                        │
                      └───────────────────────────────┘  └────────────────────────────────────┘
```

---

## 👥 User Roles & Access Control (RBAC)

The platform implements 4 task-tailored roles with strict backend permission enforcement and dedicated navigation trees:

1. **Administrator (`admin@repairtrust.gov` / `password123`)**:
   - **14 Dedicated Navigation Modules**:
     1. *Overview* (`/admin`): Live platform KPIs, storage bytes, pending configuration alerts, and user counts.
     2. *User & Role Management* (`/admin/users`): Provisioning, role assignment, and least-privilege status enforcement. Guardrail: Cannot demote or disable the last active administrator.
     3. *Department & Ward Management* (`/admin/departments-wards`): Municipal hierarchy and service area assignments.
     4. *Asset Categories & Configuration* (`/admin/asset-config`): Inspection intervals, measurement units, and asset classes.
     5. *Evidence Verification Rules* (`/admin/evidence-rules`): File limits, allowed formats, GPS radius thresholds, and LiveWork flags.
     6. *Complaint & Work Order Settings* (`/admin/complaint-settings`): SLA windows and auto-assignment. Guardrail: Cannot disable public complaint reporting.
     7. *AI Model & Detection Settings* (`/admin/ai-settings`): Perceptual hash thresholds, root-cause confidence cutoffs, and transparent synthetic benchmark notes.
     8. *Audit Logs* (`/admin/audit-logs`): Immutable journal of privileged administrative operations.
     9. *Data Quality & Duplicate Review* (`/admin/data-quality`): Scans for duplicate asset coordinates, orphan references, and reused photos without destructive deletion.
     10. *System Health* (`/admin/system-health`): CPU, memory, storage latency, and backend/AI service monitoring.
     11. *Public Transparency Settings* (`/admin/transparency`): Open data and public map parameters.
     12. *Security & Privacy* (`/admin/security`): Session timeouts, citizen PII redaction rules, and rate limits.
     13. *Backup & Data Retention* (`/admin/backup`): Verified snapshot generator with SHA-256 digests.
     14. *Profile & Settings* (`/admin/profile`): Administrator credentials and preferences.

2. **Municipal Engineer (`engineer@repairtrust.gov` / `password123`)**:
   - **15 Dedicated Navigation Modules**:
     1. *Municipal Overview* (`/engineer/overview`): Live risk aggregates, overdue repairs, and unverified closures.
     2. *Asset Registry* (`/assets`): Asset lifecycle records with duplicate asset prevention.
     3. *Complaints Hub* (`/complaints`): Citizen complaint review without silent removal powers.
     4. *Work Orders* (`/work-orders`): Task creation, team assignment, checklists, and deadline tracking.
     5. *LiveWork Proof Review* (`/engineer/livework-review`): Verification of field video footage.
     6. *Memory Graph* (`/engineer/memory-graph`): Relational provenance graph linking complaints, repairs, and failures.
     7. *AI Root-Cause Investigations* (`/investigations`): Explainable causal hypotheses for repeat failures.
     8. *Evidence-Gap Engine* (`/engineer/evidence-gap`): Identifies missing investigative evidence (e.g. downstream CCTV probe).
     9. *Infrastructure Inspections* (`/inspections`): Commissioning specialized physical surveys.
     10. *Closure Auditor* (`/engineer/closure-auditor`): Deterministic rules enforcement before work order sign-off.
     11. *Risk & Analytics* (`/analytics`): Repeat-failure rates within defined observation windows.
     12. *OpenStreetMap GIS Map* (`/engineer/map`): Asset and hotspot mapping.
     13. *Reports & Export* (`/engineer/reports`): Audit-logged data exports.
     14. *Notifications* (`/engineer/notifications`): Operational triage alerts.
     15. *Profile & Settings* (`/engineer/profile`): Certification credentials and municipal zone.

3. **Field Worker (`worker@repairtrust.gov` / `password123`)**:
   - **11 Dedicated Navigation Modules**:
     1. *Field Worker Home* (`/worker`): Active assignments, priorities, and daily checklists.
     2. *My Assigned Tasks* (`/worker/tasks`): Task acceptance, start, and reasoned pause controls.
     3. *Work Order Details* (`/worker/tasks/:id`): Linked complaints, asset history, and checklists.
     4. *Site Inspection* (`/worker/inspection`): Mobile-friendly inspection forms with GPS logging.
     5. *LiveWork Proof* (`/worker/livework`): In-browser camera capture or upload of repair video.
     6. *Before / During / After Photos* (`/worker/photos`): Tri-stage photographic proof upload.
     7. *Repair Materials & Work Notes* (`/worker/materials`): Itemized material quantities and crew notes.
     8. *Location and Check-in* (`/worker/check-in`): GPS proximity verification to asset coordinates.
     9. *Inspection History* (`/worker/history`): Log of past completed field tasks.
     10. *Notifications* (`/worker/notifications`): Reassignment alerts and engineer directives.
     11. *Profile* (`/worker/profile`): Worker badge credentials and department.

4. **Citizen / Reporter (`citizen@repairtrust.gov` / `password123`)**:
   - **9 Dedicated Navigation Modules**:
     1. *Citizen Portal Home* (`/citizen`): Live status KPIs, neighborhood activity, and quick actions.
     2. *Report an Issue* (`/report`): Multi-step wizard with category presets, mandatory photo upload, interactive Leaflet coordinate pin, and instant SHA-256 screening.
     3. *Track Complaint* (`/track`): Real-time lifecycle bar, side-by-side evidence inspection, and tamper-evident chained event ledger.
     4. *Public Infrastructure Map* (`/citizen/map`): Leaflet GIS with cluster markers, repeat-failure hotspots, and privacy-protected coordinates.
     5. *Public Transparency Dashboard* (`/transparency`): Observation window metrics, category distributions, ward resolution rates, and audit formulas.
     6. *Notifications* (`/citizen/notifications`): Real-time status update alerts and inspection scheduled notices.
     7. *Reopen / Dispute a Repair* (`/citizen/dispute`): Challenge incomplete fixes, attach follow-up photo proof, and link recurrence tickets.
     8. *My Complaints* (`/citizen/my-complaints`): Authenticated dashboard of all issues submitted by the logged-in citizen.
     9. *Profile and Privacy Settings* (`/citizen/profile`): Contact details, default anonymity toggle, and coordinate obfuscation preferences.

*Note: The UI features an instant **One-Click Quick Role Switcher Pill** in the top navigation bar for evaluators to test all 4 perspectives seamlessly.*

---

## 🌐 Public-First Citizen Accountability Pages

### 1. Public Home Page (`/`)
- Headline: *"Your City. Your Evidence. Your Right to Know."*
- Real-time municipal accountability KPI counters (Verified Repairs, Active Issues, In-Review Reports, Mean Resolution Days).
- **Interactive 3D Infrastructure Twin**: Three.js and React Three Fiber interactive box drain and culvert cutaway. Users can click on the **Grate**, **Silt Bed**, **Flume**, or **Downstream Outfall** to inspect simulated hydraulic blockage conditions and toggle water flow. (Includes responsive 2D schematic fallback).
- Interactive Leaflet + OpenStreetMap displaying privacy-safe generalized complaint coordinates.
- Live searchable and filterable complaints table and recently verified repair cards.

### 2. Multi-Step "Report an Issue" Wizard (`/report`)
- 4-step streamlined reporting flow:
  1. **Issue Category & Description**: Stormwater overflow, pothole, damaged culvert, broken footpath.
  2. **Location Selection**: Click-to-pin OpenStreetMap picker or browser geolocation with permission.
  3. **Visual Evidence**: Camera capture via `navigator.mediaDevices.getUserMedia` or file upload. Instant client-side preview with automated SHA-256 authenticity screening.
  4. **Severity & Citizen Contact**: Severity rating, contact details, or 1-click **Anonymous Reporting** toggle.
- Automatically generates unique tracking reference (e.g., `CMP-2026-0105`) and links to the public tracking portal.

### 3. Track Complaint & Challenge Closure (`/track` and `/track/:id`)
- Visual progress bar across the transparent lifecycle:
  `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `ASSIGNED` ➔ `WORK_IN_PROGRESS` ➔ `REPAIR_SUBMITTED` ➔ `VERIFIED_RESOLVED`
- Side-by-side photographic evidence comparison: Citizen original report vs. Municipal repair verification.
- **Citizen Post-Repair Feedback**: Allows residents to rate outcomes (*"Issue resolved satisfactorily"*, *"Issue partially resolved"*, *"Issue still exists"*, or *"Issue returned after rain"*). Reporting recurring failure automatically transitions the complaint to `REOPENED`.
- **Citizen Dispute / Challenge Closure**: Prominent dispute modal allows residents to challenge superficial repairs. Automatically re-opens the issue as `DISPUTED` and logs an immutable dispute event into the ledger.
- **Tamper-Evident Chained Event Ledger**: Real-time display of all lifecycle transitions. Each event cryptographically verifies `eventHash = SHA256(canonicalPayload + previousEventHash)` starting from the genesis block, ensuring no retroactive tampering.

---

## 🛡️ Multi-Layer Evidence Authenticity Screening

RepairTrust implements automated evidence screening adhering to strict scientific integrity standards:

1. **Magic Bytes Validation**: Inspects actual file header signatures (e.g., `FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `1A 45 DF A3` for WebM) to prevent file-extension spoofing.
2. **Cryptographic SHA-256 Hashing**: Generates an immutable hash of the raw upload bytes for tamper detection.
3. **Perceptual Image Hashing (dHash)**: Computes a 64-bit difference hash via `sharp` and checks Hamming distance ($\le 4$) against existing evidence to catch duplicate or recycled photos.
4. **Citizen Privacy EXIF Stripping**: Preserves GPS coordinates and camera timestamps internally for municipal verification while stripping privacy-sensitive metadata from publicly served images.
5. **No False Certainty**: The platform returns structured signals (*"No obvious issue detected"*, *"Duplicate or likely duplicate"*, *"Suspicious — manual review required"*) and explicitly disclaims that software heuristics do not replace physical inspection.

---

## 🚀 Municipal Operations Modules

### 1. Asset Registry & Profile
- 22 municipal infrastructure assets spanning stormwater box drains, culvert underpasses, and road crossings.
- Search, filter by type/status/risk, ward grouping, hydraulic capacity ratio, and repeat-failure flags.

### 2. Asset Memory Graph
- Multi-dimensional chronological timeline and directed relationship graph for every asset.
- Links: `Asset -> Complaints -> Work Orders -> Video Proof -> Engineer Review -> Rainfall Events -> Repeat Failures`.
- Clicking any node opens provenance attributes, photo thumbnails, and verified metadata.

### 3. LiveWork Proof Video Verification
- In-browser native camera recording (`navigator.mediaDevices.getUserMedia`) with live preview, recording HUD, and file upload fallback.
- Records metadata: Recording stage label (`before_cleaning`, `during_operation`, `post_completion_flow`), client GPS, and server-verified timestamp with checksums.

### 4. Deterministic Closure Auditor
- Evaluates evidence completeness:
  - `Complete`: All mandatory checklist evidence items submitted.
  - `Incomplete`: Missing post-repair photos or LiveWork Proof video.
  - `Under Review`: Awaiting authorized engineer review.
  - `Approved`: Officially signed off by municipal engineer.
- Flags rules clearly without accusatory language.

### 5. AI-Assisted Root-Cause & Evidence-Gap Engine
- Formulates explainable hypotheses: *Downstream obstruction*, *Insufficient drainage capacity*, *Repeated debris blockage*, and *Rainfall-related overflow*.
- Identifies missing evidence (e.g., *"No downstream CCTV probe within last 120 days"*) and recommends the next best physical inspection action before re-authorizing repetitive cleanings.

### 6. AI/ML Microservice (FastAPI + Scikit-Learn)
- **Model A (Random Forest Classifier)**: Predicts repeat-failure risk within a 60-day observation window. Evaluated on test split:
  - Accuracy: **72.7%**
  - Precision: **70.1%**
  - Recall: **80.3%**
  - F1-Score: **74.8%**
  - ROC-AUC: **80.5%**
- **Model B (Isolation Forest)**: Flags maintenance pattern anomalies where assets receive disproportionate repair cycles compared to peers.

---

## 🎬 Required Demonstration Walkthrough: The DR-001 Scenario

Follow these steps to demonstrate the end-to-end workflow:

1. **Step 1: Explore Public Accountability Portal**
   - Navigate to `/` (Public Home).
   - Interact with the **3D Box Drain Twin**: Click **Grate**, **Silt Bed**, and **Downstream Outfall** to observe water backup dynamics.
   - Click **Track Issue** and search for `CMP-2026-0089`. Inspect the 5-block cryptographic SHA-256 event chain.
2. **Step 2: Inspect Asset Memory Graph for DR-001**
   - Navigate to **Memory Graph -> DR-001**.
   - Observe the timeline: cleaning orders `WO-2026-001` and `WO-2026-002` were previously completed and approved, yet recurring overflow complaints (`CMP-2026-0012`, `CMP-2026-0045`, `CMP-2026-0089`) recurred following heavy rainfall events.
3. **Step 3: Worker Executes Priority Order WO-2026-003**
   - Switch role to **Field Worker** via the top navbar pill.
   - Open assigned order **WO-2026-003**. Notice the **Closure Auditor** flags missing after-work evidence and missing video proof.
   - Add Pre-Work and Post-Repair photos and record LiveWork Proof video.
   - Click **Submit Work Order for Review**. Notice the Closure Auditor updates state to **Under Review**.
4. **Step 4: Engineer Review & Evidence-Gap Decision**
   - Switch role to **Municipal Engineer**.
   - Navigate to **Investigations** for `DR-001`.
   - The **Evidence-Gap Engine** highlights that localized surface cleaning is insufficient because **no downstream CCTV probe exists**.
   - Review top hypothesis: **Downstream Obstruction (88% confidence)**.
   - Click **Authorize Downstream Inspection** to commission a CCTV probe towards junction `DR-002`.
   - Return to **WO-2026-003**, review footage, and click **Approve & Sign Off Repair**.
5. **Step 5: Citizen Challenge & Dispute**
   - Switch role to **Citizen**.
   - Open `/track/CMP-2026-0089` and test the **Dispute / Challenge Closure** or **Submit Post-Repair Feedback** modal.
   - Observe how feedback saying *"Issue still exists"* automatically reopens the complaint and adds an immutable block to the tamper-evident event ledger.

---

## 💻 Installation & Quickstart

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Start AI Microservice (FastAPI + Scikit-Learn)
```bash
cd ai-service
# Dependencies: fastapi, uvicorn, scikit-learn, numpy, pandas
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Start Backend (Express + MongoDB)
```bash
cd backend
npm install
npm start
# External MongoDB reachable? Connects automatically.
# No MongoDB running? Boots embedded MongoMemoryServer automatically with zero configuration!
```

### 3. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 4. Running Backend Unit & Acceptance Tests
```bash
cd backend

# Run core deterministic unit tests (Closure Auditor, Magic Bytes, Chained Ledger, State Machine)
npm test

# Run 10-step full-stack integrated workflow across all 4 roles
npm run test:e2e

# Run role-specific acceptance test suites (Citizen, Field Worker, Municipal Engineer, Administrator)
npm run test:acceptance
```

---

## 🎨 Design System, 3D Interaction & Accessibility

- **Interactive 3D Digital Twin**: Rendered via Three.js / React Three Fiber cutaway schematic of an arterial box drain culvert. Supports mouse drag to rotate, wheel to zoom, and click-to-inspect on components (*Grate, Silt Bed, Flume, Downstream Outfall*).
- **Pointer-Responsive 3D Depth**: Dashboard metric cards utilize `Interactive3DCard` with dynamic perspective tilt, smooth spring reset, and glassmorphic lighting highlights.
- **Accessibility & Reduced-Motion**: Fully honors `prefers-reduced-motion: reduce`. When detected, 3D tilt is automatically disabled in favor of static high-contrast accessible layouts, and the 3D drain provides a high-contrast 2D engineering schematic cross-section fallback.
- **Leaflet & OpenStreetMap**: Interactive GIS layers with custom color-coded pins for High Risk and Repeat Failure hotspots, custom HTML popups, and click-to-pin coordinate picker.
- **Evidence Authenticity & Duplicate Detection**:
  - Validates binary magic bytes signatures (`FF D8 FF`, `89 50 4E 47`, `1A 45 DF A3`).
  - Computes SHA-256 cryptographic digests and perceptual dHash (64-bit).
  - Explicitly labels advanced AI manipulation / deepfake classification as **UNAVAILABLE** pending dedicated neural weights, relying on deterministic verification.

---

## 🔒 Security & Data Privacy

- Passwords hashed using `bcryptjs` with salt rounds.
- JWT tokens with role-based access control middleware (Least-privilege: Citizen, Field Worker, Engineer, Administrator).
- Guardrail: Sole administrator account cannot be demoted or disabled.
- Guardrail: Municipal transparency charter forbids disabling public complaint reporting.
- Videos stored in private storage directories; internal filesystem paths are never exposed to clients.
- Configurable video retention policy (default 180 days) with automated cleanup flags.
- Generalized coordinates (`publicLocation`) protect citizen residence privacy on public maps.
- Public citizen tracking endpoint strictly omits internal field worker names, phone numbers, and operational audit notes.

---

## 📄 License & Disclaimer

Built for municipal infrastructure decision support. All demonstration records, coordinates, and model predictions are synthetic, labeled decision-support artifacts that augment, but do not replace, licensed structural physical engineering inspection.
