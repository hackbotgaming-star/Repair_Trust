const express = require('express');
const router = express.Router();
const path = require('path');
const Complaint = require('../../models/Complaint');
const Evidence = require('../../models/Evidence');
const Asset = require('../../models/Asset');
const { authenticate, authorizeRoles } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');
const { screenEvidenceFile } = require('../../services/evidenceScreeningService');
const { recordEvent, verifyEventChain } = require('../../services/eventHistoryService');
const { validateTransition } = require('../../services/stateMachineService');
const ComplaintEvent = require('../../models/ComplaintEvent');
const Notification = require('../../models/Notification');

// Optional authentication middleware for endpoints accessible to both public and authenticated users
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  req.user = null;
  next();
};

/**
 * 1. GET /api/v1/complaints
 * List complaints with filters, pagination, and privacy sanitization
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      status,
      category,
      assetId,
      ward,
      severity,
      search,
      page = 1,
      limit = 25,
      isVerifiedOnly,
      myComplaints
    } = req.query;

    const query = {};
    if (myComplaints === 'true') {
      if (req.user) {
        query.$or = [
          { 'reporterDetails.userId': req.user._id },
          { 'reporterDetails.email': req.user.email }
        ];
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: parseInt(limit, 10), totalPages: 0 }
        });
      }
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (assetId) query.assetId = assetId.toUpperCase();
    if (ward) query['location.ward'] = ward;
    if (severity) query.severity = severity;
    if (isVerifiedOnly === 'true') {
      query.status = { $in: ['VERIFIED_RESOLVED', 'Resolved'] };
    }

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.street': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [complaints, total] = await Promise.all([
      Complaint.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      Complaint.countDocuments(query)
    ]);

    // Public privacy sanitization: Staff and Complaint Owners can view full details
    const isStaff = req.user && (req.user.role === 'engineer' || req.user.role === 'administrator');
    const sanitized = complaints.map(c => {
      const isOwner = req.user && (
        (c.reporterDetails?.userId && c.reporterDetails.userId.toString() === req.user._id?.toString()) ||
        (c.reporterDetails?.email && c.reporterDetails.email === req.user.email)
      );
      return (isStaff || isOwner) ? c : c.toPublicView();
    });

    return res.json({
      success: true,
      data: sanitized,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 1b. GET /api/v1/complaints/reverse-geocode
 * Reverse geocodes latitude/longitude into human-readable street name and locality via OpenStreetMap Nominatim
 */
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude coordinates are required.' });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ success: false, message: 'Invalid latitude or longitude coordinates.' });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${parsedLat}&lon=${parsedLng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RepairTrust-Municipal/1.0 (contact@repairtrust.gov)',
          'Accept-Language': 'en'
        }
      }
    );

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Reverse geocoding upstream service unavailable.' });
    }

    const data = await response.json();
    const addr = data.address || {};

    const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.residential || addr.hamlet || addr.village || '';
    const locality = addr.suburb || addr.neighbourhood || addr.village || addr.city_district || addr.county || '';
    const landmark = addr.amenity || addr.building || addr.shop || (data.name && data.name !== road ? data.name : '');

    let streetCombined = road;
    if (road && locality && road !== locality) {
      streetCombined = `${road}, ${locality}`;
    } else if (!road && locality) {
      streetCombined = locality;
    }

    const finalStreet = streetCombined || (data.display_name ? data.display_name.split(',').slice(0, 2).join(',').trim() : `Street at ${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)}`);

    return res.json({
      success: true,
      data: {
        street: finalStreet,
        rawRoad: road,
        locality,
        landmark,
        fullAddress: data.display_name || '',
        city: addr.city || addr.town || addr.village || '',
        postcode: addr.postcode || ''
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Geocoding failed: ' + err.message });
  }
});

/**
 * 2. GET /api/v1/complaints/:id
 * Get single complaint
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id.toUpperCase() }).populate('evidenceIds');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint ID not found in registry.' });
    }

    const isStaff = req.user && (req.user.role === 'engineer' || req.user.role === 'administrator');
    const isOwner = req.user && (
      (complaint.reporterDetails?.userId && complaint.reporterDetails.userId.toString() === req.user._id?.toString()) ||
      (complaint.reporterDetails?.email && complaint.reporterDetails.email === req.user.email)
    );
    const result = (isStaff || isOwner) ? complaint : complaint.toPublicView();

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 3. POST /api/v1/complaints
 * Multi-step citizen reporting with file upload & automated evidence authenticity screening
 */
router.post('/', optionalAuth, upload.any(), async (req, res) => {
  try {
    const {
      assetId,
      category,
      description,
      street,
      ward,
      landmark,
      lat,
      lng,
      severity,
      reporterName,
      reporterPhone,
      reporterEmail,
      isAnonymous,
      photoUrl
    } = req.body;

    const count = await Complaint.countDocuments();
    const nextId = `CMP-2026-${String(count + 101).padStart(4, '0')}`;

    let targetAssetId = assetId ? assetId.toUpperCase() : 'DR-001';
    const parsedLat = parseFloat(lat) || 12.9716;
    const parsedLng = parseFloat(lng) || 77.5946;

    // Generalized location for public privacy (rounding coordinates to ~100m)
    const generalizedLat = Math.round(parsedLat * 1000) / 1000;
    const generalizedLng = Math.round(parsedLng * 1000) / 1000;

    const anonymousBool = isAnonymous === 'true' || isAnonymous === true;
    const repName = anonymousBool
      ? 'Anonymous Citizen'
      : (reporterName || (req.user ? req.user.name : 'Citizen Resident'));
    const repEmail = anonymousBool ? '' : (reporterEmail || (req.user ? req.user.email : ''));
    const repPhone = anonymousBool ? '' : (reporterPhone || (req.user ? req.user.phone || '' : ''));

    const complaint = new Complaint({
      complaintId: nextId,
      assetId: targetAssetId,
      category: category || 'Overflow / Waterlogging',
      description,
      reporterDetails: {
        userId: req.user ? req.user._id : null,
        name: repName,
        phone: repPhone,
        email: repEmail,
        isAnonymous: anonymousBool
      },
      location: {
        street: street || '12th Cross Main Road',
        ward: ward || 'Ward 4 (Central)',
        landmark: landmark || '',
        coordinates: { lat: parsedLat, lng: parsedLng }
      },
      publicLocation: {
        generalizedStreet: street || '12th Cross Main Road',
        ward: ward || 'Ward 4 (Central)',
        coordinates: { lat: generalizedLat, lng: generalizedLng }
      },
      severity: severity || 'Medium',
      status: 'SUBMITTED',
      photos: []
    });

    // Evidence file screening for single or multiple uploaded photos (MANDATORY)
    const files = req.files || (req.file ? [req.file] : []);
    const screeningResults = [];
    let topScreening = null;

    if ((!files || files.length === 0) && !photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Photo evidence is mandatory. Please capture or upload authentic photo evidence of the infrastructure issue.'
      });
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const screening = await screenEvidenceFile({
          filePath: file.path,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          complaintId: nextId,
          category: complaint.category
        });

        const evCount = await Evidence.countDocuments();
        const evId = `EVD-2026-${String(evCount + 101).padStart(5, '0')}`;

        const evidenceDoc = new Evidence({
          evidenceId: evId,
          complaintId: nextId,
          fileUrl: screening.publicUrl,
          storagePath: file.path,
          originalFilename: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          dimensions: screening.dimensions,
          sha256Hash: screening.sha256Hash,
          perceptualHash: screening.perceptualHash,
          magicBytesValidated: screening.magicBytesValidated,
          screeningResult: {
            status: screening.status,
            signals: screening.signals,
            confidenceScore: screening.confidenceScore,
            duplicateOfEvidenceId: screening.duplicateOfEvidenceId,
            duplicateOfComplaintId: screening.duplicateOfComplaintId,
            screenedAt: new Date()
          },
          uploadedBy: req.user ? req.user.name : complaint.reporterDetails.name,
          uploadedByRole: req.user ? req.user.role : 'citizen'
        });

        await evidenceDoc.save();
        complaint.evidenceIds.push(evidenceDoc._id);
        complaint.photos.push(screening.publicUrl);

        if (screening.status === 'Suspicious—manual review required') {
          complaint.status = 'EVIDENCE_REVIEW_REQUIRED';
          complaint.publicStatusUpdate = 'Incident registered. Evidence flagged for manual authenticity review by municipal officer.';
        }

        screeningResults.push(screening);
        if (!topScreening) topScreening = screening;
      }
    } else if (photoUrl) {
      complaint.photos.push(photoUrl);
    }

    await complaint.save();

    // Record append-only event into tamper-evident history chain
    await recordEvent({
      complaintId: complaint.complaintId,
      eventType: 'COMPLAINT_CREATED',
      actorName: complaint.reporterDetails.isAnonymous ? 'Anonymous Citizen' : complaint.reporterDetails.name,
      actorRole: req.user ? req.user.role : 'citizen',
      changeSummary: `Registered complaint ${complaint.complaintId} (${complaint.category}) at ${complaint.location.street}`,
      newStatus: complaint.status,
      details: {
        category: complaint.category,
        severity: complaint.severity,
        evidenceCount: files.length,
        screeningOutcome: topScreening ? topScreening.status : (photoUrl ? 'URL referenced' : 'No file')
      }
    });

    // Create Notification for the citizen
    const targetEmail = complaint.reporterDetails.email || (req.user ? req.user.email : '');
    if (targetEmail || req.user) {
      await Notification.create({
        recipientUserId: req.user ? req.user._id : null,
        recipientEmail: targetEmail,
        complaintId: complaint.complaintId,
        title: 'Complaint Registered',
        message: `Your issue report ${complaint.complaintId} (${complaint.category}) at ${complaint.location.street} has been registered and scheduled for municipal engineering triage.`,
        type: 'STATUS_UPDATE',
        link: `/track/${complaint.complaintId}`
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and recorded in municipal registry.',
      data: complaint,
      evidenceScreening: topScreening || (screeningResults.length > 0 ? screeningResults[0] : null),
      allScreenings: screeningResults
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/v1/complaints/:id/reopen
 * Reopen an existing resolved/closed complaint with new evidence and linked follow-up recurrence
 */
router.post('/:id/reopen', optionalAuth, upload.any(), async (req, res) => {
  try {
    const { reason, notes } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id.toUpperCase() });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Original complaint not found in registry.' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason for reopening is required.' });
    }

    const prevStatus = complaint.status;
    complaint.status = 'REOPENED';
    complaint.publicStatusUpdate = `Issue re-opened by citizen: "${reason}". Follow-up inspection scheduled.`;

    // Generate follow-up recurrence complaint
    const totalCount = await Complaint.countDocuments();
    const followUpId = `CMP-2026-${String(totalCount + 101).padStart(4, '0')}`;

    const followUp = new Complaint({
      complaintId: followUpId,
      assetId: complaint.assetId,
      category: complaint.category,
      description: `[FOLLOW-UP RECURRENCE OF ${complaint.complaintId}] ${reason}. ${notes ? `Additional observations: ${notes}` : ''}`,
      reporterDetails: {
        userId: req.user ? req.user._id : complaint.reporterDetails.userId,
        name: req.user ? req.user.name : complaint.reporterDetails.name,
        phone: complaint.reporterDetails.phone,
        email: complaint.reporterDetails.email,
        isAnonymous: complaint.reporterDetails.isAnonymous
      },
      location: complaint.location,
      publicLocation: complaint.publicLocation,
      severity: complaint.severity === 'Low' ? 'Medium' : 'High',
      status: 'REOPENED',
      recurrenceOf: complaint.complaintId,
      photos: []
    });

    // Handle any newly uploaded evidence files
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    for (const file of uploadedFiles) {
      const screening = await screenEvidenceFile({
        filePath: file.path,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        complaintId: followUpId,
        category: complaint.category
      });

      const evCount = await Evidence.countDocuments();
      const evId = `EVD-2026-${String(evCount + 101).padStart(5, '0')}`;
      const evDoc = new Evidence({
        evidenceId: evId,
        complaintId: followUpId,
        fileUrl: screening.publicUrl,
        storagePath: file.path,
        originalFilename: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        dimensions: screening.dimensions,
        sha256Hash: screening.sha256Hash,
        perceptualHash: screening.perceptualHash,
        magicBytesValidated: screening.magicBytesValidated,
        screeningResult: {
          status: screening.status,
          signals: screening.signals,
          confidenceScore: screening.confidenceScore,
          screenedAt: new Date()
        },
        uploadedBy: req.user ? req.user.name : 'Citizen Reporter',
        uploadedByRole: 'citizen'
      });
      await evDoc.save();
      followUp.evidenceIds.push(evDoc._id);
      followUp.photos.push(screening.publicUrl);
      complaint.photos.push(screening.publicUrl);
    }

    if (!complaint.followUpComplaintIds) complaint.followUpComplaintIds = [];
    complaint.followUpComplaintIds.push(followUpId);

    await Promise.all([complaint.save(), followUp.save()]);

    // Chained event on original complaint
    await recordEvent({
      complaintId: complaint.complaintId,
      eventType: 'COMPLAINT_REOPENED',
      actorName: req.user ? req.user.name : complaint.reporterDetails.name,
      actorRole: 'citizen',
      changeSummary: `Citizen reopened complaint: "${reason}". Follow-up recurrence ${followUpId} generated.`,
      previousStatus: prevStatus,
      newStatus: 'REOPENED',
      details: { reason, followUpComplaintId: followUpId }
    });

    // Chained event on follow-up complaint
    await recordEvent({
      complaintId: followUp.complaintId,
      eventType: 'COMPLAINT_CREATED',
      actorName: req.user ? req.user.name : complaint.reporterDetails.name,
      actorRole: 'citizen',
      changeSummary: `Created linked recurrence record for recurring failure at ${complaint.assetId}`,
      newStatus: 'REOPENED',
      details: { recurrenceOf: complaint.complaintId, reason }
    });

    // Notification
    const notifEmail = complaint.reporterDetails.email || (req.user ? req.user.email : '');
    if (notifEmail || req.user) {
      await Notification.create({
        recipientUserId: req.user ? req.user._id : complaint.reporterDetails.userId,
        recipientEmail: notifEmail,
        complaintId: complaint.complaintId,
        title: 'Repair Reopened for Investigation',
        message: `Your report that the problem continues at ${complaint.complaintId} has been registered. Linked follow-up reference: ${followUpId}.`,
        type: 'REOPEN_CONFIRMED',
        link: `/track/${complaint.complaintId}`
      });
    }

    return res.json({
      success: true,
      message: `Complaint ${complaint.complaintId} re-opened and follow-up reference ${followUpId} generated.`,
      complaint,
      followUpComplaint: followUp
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * 4. PATCH /api/v1/complaints/:id
 * Transparent state machine transition with reason recording
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, publicStatusUpdate, assignedDepartment, rejectionReason } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id.toUpperCase() });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const previousStatus = complaint.status;

    if (status && status !== previousStatus) {
      const validation = validateTransition({
        currentStatus: previousStatus,
        nextStatus: status,
        userRole: req.user.role,
        rejectionReason,
        hasClosureEvidence: Boolean(complaint.closureVerification && complaint.closureVerification.afterPhotos && complaint.closureVerification.afterPhotos.length > 0)
      });

      if (!validation.allowed) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      complaint.status = status;
      if (rejectionReason) complaint.rejectionReason = rejectionReason;
    }

    if (publicStatusUpdate) complaint.publicStatusUpdate = publicStatusUpdate;
    if (assignedDepartment) complaint.assignedDepartment = assignedDepartment;

    await complaint.save();

    // Record event in append-only tamper-evident chain
    await recordEvent({
      complaintId: complaint.complaintId,
      eventType: status === 'REJECTED_WITH_REASON' ? 'REJECTED_WITH_REASON' : 'STATUS_CHANGED',
      actorId: req.user._id ? req.user._id.toString() : 'auth',
      actorName: req.user.name || req.user.email,
      actorRole: req.user.role,
      changeSummary: `Status transitioned from ${previousStatus} to ${complaint.status}${rejectionReason ? ` (Reason: ${rejectionReason})` : ''}`,
      previousStatus,
      newStatus: complaint.status,
      details: { rejectionReason, assignedDepartment, publicStatusUpdate }
    });

    // Notify citizen if recipient exists
    const notifTargetEmail = complaint.reporterDetails?.email;
    if (notifTargetEmail || complaint.reporterDetails?.userId) {
      await Notification.create({
        recipientUserId: complaint.reporterDetails?.userId || null,
        recipientEmail: notifTargetEmail || '',
        complaintId: complaint.complaintId,
        title: `Complaint Status: ${complaint.status.replace(/_/g, ' ')}`,
        message: `Your complaint ${complaint.complaintId} has progressed to ${complaint.status.replace(/_/g, ' ')}. ${publicStatusUpdate || ''}`,
        type: 'STATUS_UPDATE',
        link: `/track/${complaint.complaintId}`
      });
    }

    return res.json({ success: true, data: complaint });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * 5. POST /api/v1/complaints/:id/dispute
 * Citizen challenges / disputes an official closure or rejection
 */
router.post('/:id/dispute', optionalAuth, async (req, res) => {
  try {
    const { reason, photos } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id.toUpperCase() });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const previousStatus = complaint.status;
    const disputeId = `DSP-${Date.now().toString().slice(-6)}`;

    complaint.disputes.push({
      disputeId,
      reason,
      evidencePhotos: photos || [],
      submittedBy: req.user ? req.user.name : 'Citizen Reporter',
      status: 'PENDING'
    });

    complaint.status = 'DISPUTED';
    complaint.publicStatusUpdate = `Closure decision challenged by citizen (Dispute Reference: ${disputeId}). Re-opened for municipal investigation.`;
    await complaint.save();

    await recordEvent({
      complaintId: complaint.complaintId,
      eventType: 'DISPUTE_FILED',
      actorName: req.user ? req.user.name : 'Citizen Reporter',
      actorRole: req.user ? req.user.role : 'citizen',
      changeSummary: `Citizen filed closure dispute ${disputeId}: "${reason}"`,
      previousStatus,
      newStatus: 'DISPUTED',
      details: { disputeId, reason }
    });

    return res.json({
      success: true,
      message: 'Dispute recorded and complaint status updated to DISPUTED for municipal re-review.',
      data: complaint
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * 6. POST /api/v1/complaints/:id/feedback
 * Citizen post-repair feedback (Section 3E)
 */
router.post('/:id/feedback', optionalAuth, async (req, res) => {
  try {
    const { outcome, notes, photos } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id.toUpperCase() });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.citizenFeedback.push({
      outcome,
      notes: notes || '',
      photos: photos || []
    });

    // If feedback says "Issue still exists" or "returned after rain", automatically reopen
    if (outcome === 'Issue still exists' || outcome === 'Issue returned after rain or normal usage') {
      const prevStatus = complaint.status;
      complaint.status = 'REOPENED';
      complaint.publicStatusUpdate = `Complaint reopened based on citizen feedback: ${outcome}. Requires follow-up inspection.`;
      
      await recordEvent({
        complaintId: complaint.complaintId,
        eventType: 'COMPLAINT_REOPENED',
        actorName: req.user ? req.user.name : 'Citizen Reporter',
        actorRole: req.user ? req.user.role : 'citizen',
        changeSummary: `Reopened following citizen feedback: ${outcome} (${notes || 'No extra notes'})`,
        previousStatus: prevStatus,
        newStatus: 'REOPENED',
        details: { outcome, notes }
      });
    }

    await complaint.save();

    await recordEvent({
      complaintId: complaint.complaintId,
      eventType: 'CITIZEN_FEEDBACK_RECEIVED',
      actorName: req.user ? req.user.name : 'Citizen Reporter',
      actorRole: req.user ? req.user.role : 'citizen',
      changeSummary: `Citizen recorded post-repair feedback: ${outcome}`,
      details: { outcome, notes }
    });

    return res.json({
      success: true,
      message: 'Feedback received and permanently recorded in complaint history.',
      data: complaint
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * 7. GET /api/v1/complaints/:id/events
 * Append-only tamper-evident event history chain
 */
router.get('/:id/events', async (req, res) => {
  try {
    const complaintId = req.params.id.toUpperCase();
    const events = await ComplaintEvent.find({ complaintId }).sort({ timestamp: 1 });
    const chainVerification = await verifyEventChain(complaintId);

    return res.json({
      success: true,
      complaintId,
      chainIntegrity: chainVerification,
      events
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 8. POST /api/v1/complaints/:id/verify-repair
 * Engineer official verification sign-off (Section 6 closure rules)
 */
router.post('/:id/verify-repair', authenticate, authorizeRoles('engineer', 'administrator'), async (req, res) => {
  try {
    const { decision, notes, beforePhotos, afterPhotos, videoProofId } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id.toUpperCase() });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const previousStatus = complaint.status;

    if (decision === 'VERIFIED_RESOLVED') {
      if (!afterPhotos || afterPhotos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark VERIFIED_RESOLVED without photographic evidence of the completed repair.'
        });
      }
      complaint.status = 'VERIFIED_RESOLVED';
      complaint.publicStatusUpdate = `Repair independently verified and signed off by ${req.user.name || 'Municipal Engineer'}. Issue resolved.`;
    } else {
      complaint.status = 'AWAITING_VERIFICATION';
      complaint.publicStatusUpdate = 'Repair evidence returned by municipal engineer for additional field documentation.';
    }

    complaint.closureVerification = {
      verifiedBy: req.user.name || req.user.email,
      verifiedAt: new Date(),
      decision,
      notes: notes || '',
      beforePhotos: beforePhotos || [],
      afterPhotos: afterPhotos || [],
      videoProofId: videoProofId || ''
    };

    await complaint.save();

    await recordEvent({
      complaintId: complaint.complaintId,
      eventType: decision === 'VERIFIED_RESOLVED' ? 'REPAIR_VERIFIED' : 'REPAIR_RETURNED',
      actorId: req.user._id.toString(),
      actorName: req.user.name || req.user.email,
      actorRole: req.user.role,
      changeSummary: `Official repair verification decision: ${decision}. ${notes || ''}`,
      previousStatus,
      newStatus: complaint.status,
      details: { decision, notes, afterPhotosCount: (afterPhotos || []).length }
    });

    return res.json({ success: true, data: complaint });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
