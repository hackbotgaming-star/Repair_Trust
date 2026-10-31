const mongoose = require('mongoose');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Complaint = require('../models/Complaint');
const WorkOrder = require('../models/WorkOrder');
const EvidenceVideo = require('../models/EvidenceVideo');
const Evidence = require('../models/Evidence');
const ComplaintEvent = require('../models/ComplaintEvent');
const Inspection = require('../models/Inspection');
const Rainfall = require('../models/Rainfall');
const Investigation = require('../models/Investigation');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { recordEvent } = require('../services/eventHistoryService');
const path = require('path');
const fs = require('fs');

const seedDatabase = async () => {
  console.log('[Seeder] Clearing existing collections for clean demonstration setup...');
  await Promise.all([
    User.deleteMany({}),
    Asset.deleteMany({}),
    Complaint.deleteMany({}),
    WorkOrder.deleteMany({}),
    EvidenceVideo.deleteMany({}),
    Evidence.deleteMany({}),
    ComplaintEvent.deleteMany({}),
    Inspection.deleteMany({}),
    Rainfall.deleteMany({}),
    Investigation.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({})
  ]);

  // Ensure uploads directories and demo video exist
  const uploadsDir = path.join(__dirname, '../../uploads');
  const videosDir = path.join(uploadsDir, 'videos');
  const photosDir = path.join(uploadsDir, 'photos');
  [uploadsDir, videosDir, photosDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Create a lightweight playable sample mp4/webm placeholder file if not exists
  const demoVideoPath = path.join(videosDir, 'demo-drain-cleaning.webm');
  if (!fs.existsSync(demoVideoPath)) {
    // Write empty or minimal webm header so it's a real file on disk
    fs.writeFileSync(demoVideoPath, Buffer.from([
      0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81, 0x01, 0x42, 0xf2, 0x81, 0x04,
      0x42, 0xf3, 0x81, 0x08, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d, 0x42, 0x87, 0x81, 0x04, 0x42, 0x85, 0x81, 0x02
    ]));
  }

  console.log('[Seeder] Seeding municipal users...');
  const users = await User.create([
    {
      name: 'Elena Rostova',
      email: 'admin@repairtrust.gov',
      password: 'password123',
      role: 'administrator',
      department: 'Municipal Operations & Quality Directorate',
      badgeNumber: 'ADM-901',
      phone: '+1 (555) 019-2831'
    },
    {
      name: 'Vikram Sengupta, P.E.',
      email: 'engineer@repairtrust.gov',
      password: 'password123',
      role: 'engineer',
      department: 'Stormwater Infrastructure & Drainage Engineering',
      badgeNumber: 'ENG-404',
      phone: '+1 (555) 019-4402'
    },
    {
      name: 'Ramesh Kumar',
      email: 'worker@repairtrust.gov',
      password: 'password123',
      role: 'field_worker',
      department: 'Zone 4 Field Maintenance Squad B',
      badgeNumber: 'FW-108',
      phone: '+1 (555) 019-8819'
    },
    {
      name: 'Amina Patel',
      email: 'citizen@repairtrust.gov',
      password: 'password123',
      role: 'citizen',
      department: 'Public Resident',
      phone: '+1 (555) 019-7734'
    }
  ]);

  const engineerUser = users[1];
  const workerUser = users[2];
  const citizenUser = users[3];

  console.log('[Seeder] Seeding 22 municipal infrastructure assets (Stormwater Drains, Culverts, Roads)...');
  
  // Base coordinates around a central urban corridor (lat: 12.9716, lng: 77.5946)
  const assetSpecs = [
    {
      assetId: 'DR-001',
      name: '12th Cross Arterial Box Drain',
      type: 'storm-water drain',
      status: 'Maintenance Required',
      location: { street: '12th Cross, MG Commercial Avenue', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9716, lng: 77.5946 } },
      dimensions: { lengthMeters: 140, depthMeters: 2.2, widthMeters: 1.8, diameterMm: 1200, material: 'Reinforced Concrete Pre-Cast Box' },
      installationYear: 2017,
      debrisSeverityIndex: 4.2,
      capacityRatio: 0.62,
      riskLevel: 'HIGH',
      riskScore: 84.5,
      repeatFailureFlag: true,
      repeatFailureCount: 3,
      downstreamAssetId: 'DR-002',
      recommendedAction: 'Immediate Downstream Camera Inspection; repeat overflow despite cyclic cleaning'
    },
    {
      assetId: 'DR-002',
      name: 'Railway Culvert Underpass Flume',
      type: 'culvert',
      status: 'Under Investigation',
      location: { street: 'Railway Feeder Junction, MG Sector', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9735, lng: 77.5982 } },
      dimensions: { lengthMeters: 65, depthMeters: 2.5, widthMeters: 2.4, diameterMm: 1500, material: 'Twin Reinforced Concrete Pipes' },
      installationYear: 2014,
      debrisSeverityIndex: 3.8,
      capacityRatio: 0.71,
      riskLevel: 'HIGH',
      riskScore: 76.0,
      repeatFailureFlag: true,
      repeatFailureCount: 2,
      downstreamAssetId: 'DR-005',
      recommendedAction: 'CCTV Camera Invert Survey to detect downstream constriction'
    },
    {
      assetId: 'DR-003',
      name: 'Ashoka Market Surface Channel',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Ashoka Bazaar Road', ward: 'Ward 2 (Market East)', coordinates: { lat: 12.9682, lng: 77.5891 } },
      dimensions: { lengthMeters: 220, depthMeters: 1.4, widthMeters: 1.1, diameterMm: 900, material: 'Stone Masonry with Steel Grates' },
      installationYear: 2019,
      debrisSeverityIndex: 3.1,
      capacityRatio: 0.88,
      riskLevel: 'MODERATE',
      riskScore: 48.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      downstreamAssetId: 'DR-004',
      recommendedAction: 'Install heavy-duty litter trash traps at vegetable market outlet'
    },
    {
      assetId: 'DR-004',
      name: 'East Canal Collector Main',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'East Canal Parkway', ward: 'Ward 2 (Market East)', coordinates: { lat: 12.9654, lng: 77.5932 } },
      dimensions: { lengthMeters: 450, depthMeters: 3.0, widthMeters: 2.8, diameterMm: 2000, material: 'Reinforced Concrete Trapezoidal Canal' },
      installationYear: 2020,
      debrisSeverityIndex: 1.8,
      capacityRatio: 1.15,
      riskLevel: 'LOW',
      riskScore: 18.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Semi-annual de-silting'
    },
    {
      assetId: 'DR-005',
      name: 'Industrial Estate Primary Outfall',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Phase 2 Link Road', ward: 'Ward 6 (Industrial South)', coordinates: { lat: 12.9591, lng: 77.6015 } },
      dimensions: { lengthMeters: 380, depthMeters: 2.6, widthMeters: 2.2, diameterMm: 1600, material: 'Reinforced Concrete Culvert' },
      installationYear: 2016,
      debrisSeverityIndex: 2.6,
      capacityRatio: 0.92,
      riskLevel: 'LOW',
      riskScore: 22.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Monitor industrial sludge effluent'
    },
    {
      assetId: 'DR-006',
      name: 'Victoria Hospital Storm Lateral',
      type: 'storm-water drain',
      status: 'Maintenance Required',
      location: { street: 'Hospital Perimeter Blvd', ward: 'Ward 3 (Civic West)', coordinates: { lat: 12.9752, lng: 77.5874 } },
      dimensions: { lengthMeters: 180, depthMeters: 1.6, widthMeters: 1.2, diameterMm: 900, material: 'Covered Precast Concrete Slabs' },
      installationYear: 2015,
      debrisSeverityIndex: 3.5,
      capacityRatio: 0.69,
      riskLevel: 'HIGH',
      riskScore: 71.0,
      repeatFailureFlag: true,
      repeatFailureCount: 2,
      recommendedAction: 'Clear hospital stormwater junction backflow'
    },
    {
      assetId: 'DR-007',
      name: 'Outer Ring Road Culvert #14',
      type: 'culvert',
      status: 'Active',
      location: { street: 'Outer Ring Highway Mile 8', ward: 'Ward 5 (North Ring)', coordinates: { lat: 12.9810, lng: 77.6102 } },
      dimensions: { lengthMeters: 90, depthMeters: 2.0, widthMeters: 2.0, diameterMm: 1400, material: 'Box Culvert' },
      installationYear: 2021,
      debrisSeverityIndex: 1.5,
      capacityRatio: 1.2,
      riskLevel: 'LOW',
      riskScore: 12.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Nominal maintenance'
    },
    {
      assetId: 'DR-008',
      name: 'Lake Overflow Embankment Channel',
      type: 'storm-water drain',
      status: 'Under Investigation',
      location: { street: 'Sankey Perimeter Road', ward: 'Ward 1 (Lakeside North)', coordinates: { lat: 12.9845, lng: 77.5789 } },
      dimensions: { lengthMeters: 310, depthMeters: 2.1, widthMeters: 1.7, diameterMm: 1100, material: 'Stone Masonry' },
      installationYear: 2013,
      debrisSeverityIndex: 3.7,
      capacityRatio: 0.67,
      riskLevel: 'HIGH',
      riskScore: 79.0,
      repeatFailureFlag: true,
      repeatFailureCount: 2,
      recommendedAction: 'Evaluate sluice gate discharge capacity'
    },
    {
      assetId: 'DR-009',
      name: 'Metro Station Plaza Drain',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Central Metro Concourse', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9740, lng: 77.5920 } },
      dimensions: { lengthMeters: 110, depthMeters: 1.2, widthMeters: 1.0, diameterMm: 800, material: 'Ductile Iron Slotted Drain' },
      installationYear: 2022,
      debrisSeverityIndex: 1.2,
      capacityRatio: 1.05,
      riskLevel: 'LOW',
      riskScore: 10.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Grate cleaning before weekend rush'
    },
    {
      assetId: 'DR-010',
      name: '7th Main Residential Drain',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: '7th Main, Malleshwaram West', ward: 'Ward 1 (Lakeside North)', coordinates: { lat: 12.9862, lng: 77.5714 } },
      dimensions: { lengthMeters: 160, depthMeters: 1.3, widthMeters: 0.9, diameterMm: 750, material: 'Concrete Pipe with Sump Traps' },
      installationYear: 2018,
      debrisSeverityIndex: 2.4,
      capacityRatio: 0.84,
      riskLevel: 'LOW',
      riskScore: 24.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Cyclic desilting'
    },
    {
      assetId: 'RD-001',
      name: 'Residency Road Drain Crossway',
      type: 'road',
      status: 'Active',
      location: { street: 'Residency Road Crossing', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9698, lng: 77.5990 } },
      dimensions: { lengthMeters: 45, depthMeters: 1.0, widthMeters: 12.0, diameterMm: 600, material: 'Asphalt pavement over reinforced culvert' },
      installationYear: 2020,
      debrisSeverityIndex: 2.1,
      capacityRatio: 0.95,
      riskLevel: 'LOW',
      riskScore: 20.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Inspect storm grates along kerbside'
    },
    {
      assetId: 'DR-011',
      name: 'Old Town Heritage Gate Drain',
      type: 'storm-water drain',
      status: 'Maintenance Required',
      location: { street: 'Heritage Gate Corridor', ward: 'Ward 3 (Civic West)', coordinates: { lat: 12.9670, lng: 77.5795 } },
      dimensions: { lengthMeters: 95, depthMeters: 1.8, widthMeters: 1.4, diameterMm: 1000, material: 'Arched Brick Masonry' },
      installationYear: 2008,
      debrisSeverityIndex: 3.9,
      capacityRatio: 0.64,
      riskLevel: 'HIGH',
      riskScore: 82.0,
      repeatFailureFlag: true,
      repeatFailureCount: 3,
      recommendedAction: 'Structural lining reinforcement'
    },
    {
      assetId: 'DR-012',
      name: 'Commercial Street Storm Feeder',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Commercial Street Retail Walk', ward: 'Ward 2 (Market East)', coordinates: { lat: 12.9815, lng: 77.6042 } },
      dimensions: { lengthMeters: 200, depthMeters: 1.4, widthMeters: 1.1, diameterMm: 850, material: 'Precast Concrete' },
      installationYear: 2019,
      debrisSeverityIndex: 2.8,
      capacityRatio: 0.81,
      riskLevel: 'MODERATE',
      riskScore: 42.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Clean solid waste screen'
    },
    {
      assetId: 'DR-013',
      name: 'Botanical Gardens Runoff Swale',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Lalbagh North Perimeter', ward: 'Ward 3 (Civic West)', coordinates: { lat: 12.9550, lng: 77.5880 } },
      dimensions: { lengthMeters: 275, depthMeters: 1.5, widthMeters: 2.0, diameterMm: 1000, material: 'Bio-swale with Riprap Rock Lining' },
      installationYear: 2021,
      debrisSeverityIndex: 1.4,
      capacityRatio: 1.3,
      riskLevel: 'LOW',
      riskScore: 14.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Clear silt catch-basin'
    },
    {
      assetId: 'DR-014',
      name: 'Expressway Interchange Box Drain',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Flyover Junction 3', ward: 'Ward 5 (North Ring)', coordinates: { lat: 12.9880, lng: 77.6180 } },
      dimensions: { lengthMeters: 190, depthMeters: 2.2, widthMeters: 1.9, diameterMm: 1300, material: 'Heavy Duty Box Culvert' },
      installationYear: 2018,
      debrisSeverityIndex: 2.2,
      capacityRatio: 0.90,
      riskLevel: 'LOW',
      riskScore: 26.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Routine check'
    },
    {
      assetId: 'DR-015',
      name: 'South Bus Depot Apron Drain',
      type: 'storm-water drain',
      status: 'Maintenance Required',
      location: { street: 'Transit Center Terminal Road', ward: 'Ward 6 (Industrial South)', coordinates: { lat: 12.9490, lng: 77.5950 } },
      dimensions: { lengthMeters: 130, depthMeters: 1.5, widthMeters: 1.3, diameterMm: 950, material: 'Concrete with Oil-Grit Separator' },
      installationYear: 2016,
      debrisSeverityIndex: 3.4,
      capacityRatio: 0.72,
      riskLevel: 'MODERATE',
      riskScore: 56.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Pump out grit interceptor'
    },
    {
      assetId: 'DR-016',
      name: 'Koramangala Valley Trunk Section A',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Valley Primary Channel', ward: 'Ward 6 (Industrial South)', coordinates: { lat: 12.9420, lng: 77.6150 } },
      dimensions: { lengthMeters: 600, depthMeters: 3.5, widthMeters: 4.2, diameterMm: 3000, material: 'Wide RCC Open Canal' },
      installationYear: 2019,
      debrisSeverityIndex: 2.3,
      capacityRatio: 1.1,
      riskLevel: 'LOW',
      riskScore: 21.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Annual excavator dredging'
    },
    {
      assetId: 'DR-017',
      name: 'Indiranagar 100ft Road Collector',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: '100 Feet Road, 12th Main', ward: 'Ward 2 (Market East)', coordinates: { lat: 12.9780, lng: 77.6380 } },
      dimensions: { lengthMeters: 240, depthMeters: 1.7, widthMeters: 1.4, diameterMm: 1100, material: 'Precast Covered Canal' },
      installationYear: 2017,
      debrisSeverityIndex: 2.5,
      capacityRatio: 0.86,
      riskLevel: 'LOW',
      riskScore: 29.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Inspect storm manholes'
    },
    {
      assetId: 'DR-018',
      name: 'Ulsoor Lake Inlet Flume',
      type: 'culvert',
      status: 'Active',
      location: { street: 'Lake Inlet Sluice Weir', ward: 'Ward 2 (Market East)', coordinates: { lat: 12.9830, lng: 77.6200 } },
      dimensions: { lengthMeters: 75, depthMeters: 2.4, widthMeters: 2.0, diameterMm: 1400, material: 'Stone and Concrete Flume' },
      installationYear: 2015,
      debrisSeverityIndex: 2.9,
      capacityRatio: 0.89,
      riskLevel: 'MODERATE',
      riskScore: 38.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Clear floating aquatic weeds'
    },
    {
      assetId: 'DR-019',
      name: 'Rajajinagar 1st Block Lateral',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Dr. Rajkumar Road', ward: 'Ward 1 (Lakeside North)', coordinates: { lat: 12.9910, lng: 77.5580 } },
      dimensions: { lengthMeters: 150, depthMeters: 1.3, widthMeters: 1.0, diameterMm: 800, material: 'Concrete Invert' },
      installationYear: 2020,
      debrisSeverityIndex: 1.9,
      capacityRatio: 0.94,
      riskLevel: 'LOW',
      riskScore: 16.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Routine inspection'
    },
    {
      assetId: 'DR-020',
      name: 'Basavanagudi Historic Bull Temple Drain',
      type: 'storm-water drain',
      status: 'Active',
      location: { street: 'Bull Temple Road', ward: 'Ward 3 (Civic West)', coordinates: { lat: 12.9430, lng: 77.5680 } },
      dimensions: { lengthMeters: 175, depthMeters: 1.5, widthMeters: 1.2, diameterMm: 900, material: 'Heritage Granite Slab Drain' },
      installationYear: 2012,
      debrisSeverityIndex: 2.7,
      capacityRatio: 0.82,
      riskLevel: 'LOW',
      riskScore: 32.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Preserve masonry integrity'
    },
    {
      assetId: 'DR-021',
      name: 'Hebbal Flyover Invert Culvert',
      type: 'culvert',
      status: 'Active',
      location: { street: 'Airport Highway Feeder', ward: 'Ward 5 (North Ring)', coordinates: { lat: 13.0350, lng: 77.5970 } },
      dimensions: { lengthMeters: 120, depthMeters: 2.8, widthMeters: 2.5, diameterMm: 1800, material: 'Twin Cell Concrete Box' },
      installationYear: 2021,
      debrisSeverityIndex: 1.6,
      capacityRatio: 1.25,
      riskLevel: 'LOW',
      riskScore: 11.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Semi-annual check'
    },
    {
      assetId: 'DR-022',
      name: 'Outer Ring Sarjapur Junction Canal',
      type: 'storm-water drain',
      status: 'Maintenance Required',
      location: { street: 'Sarjapur Main Road', ward: 'Ward 6 (Industrial South)', coordinates: { lat: 12.9240, lng: 77.6830 } },
      dimensions: { lengthMeters: 260, depthMeters: 2.0, widthMeters: 1.8, diameterMm: 1200, material: 'Precast RCC' },
      installationYear: 2019,
      debrisSeverityIndex: 3.3,
      capacityRatio: 0.74,
      riskLevel: 'MODERATE',
      riskScore: 52.0,
      repeatFailureFlag: false,
      repeatFailureCount: 0,
      recommendedAction: 'Clear construction silt runoff'
    }
  ];

  await Asset.insertMany(assetSpecs);

  console.log('[Seeder] Seeding historical records for DR-001 scenario (Complaints, Work Orders, Rainfall, Inspections)...');

  // Rainfall events around DR-001
  const rainfalls = await Rainfall.create([
    {
      stationId: 'MET-04',
      stationName: 'Ward 4 Hydro-Met Observatory',
      ward: 'Ward 4 (Central)',
      date: new Date('2026-08-14T14:30:00Z'),
      rainfallMm: 46.5,
      intensityCategory: 'Heavy (40-80mm)',
      stormEventId: 'STORM-2026-08A'
    },
    {
      stationId: 'MET-04',
      stationName: 'Ward 4 Hydro-Met Observatory',
      ward: 'Ward 4 (Central)',
      date: new Date('2026-09-02T16:00:00Z'),
      rainfallMm: 52.0,
      intensityCategory: 'Heavy (40-80mm)',
      stormEventId: 'STORM-2026-09A'
    },
    {
      stationId: 'MET-04',
      stationName: 'Ward 4 Hydro-Met Observatory',
      ward: 'Ward 4 (Central)',
      date: new Date('2026-10-10T11:15:00Z'),
      rainfallMm: 28.0,
      intensityCategory: 'Moderate (15-40mm)',
      stormEventId: 'STORM-2026-10B'
    }
  ]);

  // Citizen Complaints for DR-001
  const complaints = await Complaint.create([
    {
      complaintId: 'CMP-2026-0012',
      assetId: 'DR-001',
      category: 'Overflow / Waterlogging',
      description: 'Severe road flooding at 12th Cross intersection during afternoon storm. Water backing up through curb inlets into shop fronts.',
      reporterDetails: { name: 'Sunil Rao', phone: '+1 555-019-1122', email: 'sunil.rao@example.com' },
      location: { street: '12th Cross, MG Avenue', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9716, lng: 77.5946 } },
      severity: 'Critical',
      status: 'Resolved',
      photos: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'],
      publicStatusUpdate: 'Cleaning crew dispatched and completed de-silting.',
      createdAt: new Date('2026-08-14T15:20:00Z')
    },
    {
      complaintId: 'CMP-2026-0045',
      assetId: 'DR-001',
      category: 'Overflow / Waterlogging',
      description: 'Repeat overflow just 18 days after cleaning! Entire pedestrian crossing submerged under 30cm of stagnant runoff.',
      reporterDetails: { userId: citizenUser._id, name: 'Amina Patel', phone: '+1 555-019-7734', email: 'citizen@repairtrust.gov' },
      location: { street: '12th Cross, MG Avenue', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9716, lng: 77.5946 } },
      severity: 'Critical',
      status: 'Resolved',
      photos: ['https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80'],
      publicStatusUpdate: 'Secondary emergency de-silting conducted by Zone 4 squad.',
      createdAt: new Date('2026-09-02T17:45:00Z')
    },
    {
      complaintId: 'CMP-2026-0089',
      assetId: 'DR-001',
      category: 'Overflow / Waterlogging',
      description: 'Third time this season! Water will not drain away even during moderate shower. There must be a major downstream obstruction.',
      reporterDetails: { userId: citizenUser._id, name: 'Amina Patel', phone: '+1 555-019-7734', email: 'citizen@repairtrust.gov' },
      location: { street: '12th Cross, MG Avenue', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9716, lng: 77.5946 } },
      severity: 'High',
      status: 'Assigned',
      photos: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'],
      linkedWorkOrderId: 'WO-2026-003',
      publicStatusUpdate: 'Under active municipal engineering investigation with assigned field work order.',
      createdAt: new Date('2026-10-10T12:30:00Z')
    },
    {
      complaintId: 'CMP-2026-0090',
      assetId: 'DR-001',
      category: 'Debris / Silt Accumulation',
      description: 'Silt build up near junction curb causing water to pool around bus shelter.',
      reporterDetails: { name: 'Deepa Hegde', phone: '+1 555-019-3388', email: 'deepa.h@example.com' },
      location: { street: '12th Cross, Bus Shelter', ward: 'Ward 4 (Central)', coordinates: { lat: 12.9718, lng: 77.5948 } },
      severity: 'Medium',
      status: 'Assigned',
      linkedWorkOrderId: 'WO-2026-003',
      publicStatusUpdate: 'Consolidated with ongoing work order WO-2026-003.',
      createdAt: new Date('2026-10-12T09:15:00Z')
    }
  ]);

  // Historical Work Orders for DR-001
  const pastVideo1 = await EvidenceVideo.create({
    videoId: 'VID-2026-0001',
    workOrderId: 'WO-2026-001',
    assetId: 'DR-001',
    submittedBy: workerUser._id,
    submittedByName: workerUser.name,
    fileUrl: '/uploads/videos/demo-drain-cleaning.webm',
    filename: 'demo-drain-cleaning.webm',
    fileSize: 14200000,
    mimeType: 'video/webm',
    durationSeconds: 22,
    stage: 'post_completion_flow',
    clientProvidedMetadata: {
      clientTimestamp: new Date('2026-08-16T11:00:00Z'),
      isLiveCameraCapture: true,
      reportedCoordinates: { lat: 12.9716, lng: 77.5946 }
    },
    serverVerifiedMetadata: {
      receivedAt: new Date('2026-08-16T11:02:14Z'),
      integrityCheckPassed: true,
      allowedFormat: true
    },
    reviewStatus: 'Accepted',
    reviewerComments: 'Invert cleared of local silt. Work order accepted.',
    reviewedBy: engineerUser._id,
    reviewedAt: new Date('2026-08-16T15:30:00Z'),
    createdAt: new Date('2026-08-16T11:00:00Z')
  });

  const pastVideo2 = await EvidenceVideo.create({
    videoId: 'VID-2026-0002',
    workOrderId: 'WO-2026-002',
    assetId: 'DR-001',
    submittedBy: workerUser._id,
    submittedByName: workerUser.name,
    fileUrl: '/uploads/videos/demo-drain-cleaning.webm',
    filename: 'demo-drain-cleaning.webm',
    fileSize: 18400000,
    mimeType: 'video/webm',
    durationSeconds: 28,
    stage: 'post_completion_flow',
    clientProvidedMetadata: {
      clientTimestamp: new Date('2026-09-04T10:30:00Z'),
      isLiveCameraCapture: true,
      reportedCoordinates: { lat: 12.9716, lng: 77.5946 }
    },
    serverVerifiedMetadata: {
      receivedAt: new Date('2026-09-04T10:31:45Z'),
      integrityCheckPassed: true,
      allowedFormat: true
    },
    reviewStatus: 'Accepted',
    reviewerComments: 'Secondary cleaning completed. Note: Water recedes unusually slowly; suspect downstream choke.',
    reviewedBy: engineerUser._id,
    reviewedAt: new Date('2026-09-04T14:10:00Z'),
    createdAt: new Date('2026-09-04T10:30:00Z')
  });

  // Create Work Orders
  await WorkOrder.create([
    {
      workOrderId: 'WO-2026-001',
      assetId: 'DR-001',
      linkedComplaintIds: ['CMP-2026-0012'],
      problemDescription: 'De-silt 140m box drain section following August storm overflow complaint.',
      assignedTo: workerUser._id,
      assignedWorkerName: 'Ramesh Kumar (Zone 4 Field Team)',
      assignedTeam: 'Zone 4 Field Maintenance Squad B',
      priority: 'High',
      repairType: 'Drain De-silting & Cleaning',
      status: 'Approved',
      closureAuditorStatus: 'Approved',
      closureAuditorFlags: [],
      beforeEvidence: [{ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', caption: 'Heavy silt accumulation pre-cleaning', type: 'photo', timestamp: new Date('2026-08-15T09:00:00Z') }],
      duringEvidence: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', caption: 'Sludge extraction using vacuum gully sucker', type: 'photo', timestamp: new Date('2026-08-15T13:00:00Z') }],
      afterEvidence: [{ url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80', caption: 'Clean concrete invert bed', type: 'photo', timestamp: new Date('2026-08-16T10:30:00Z') }],
      videoEvidence: [pastVideo1._id],
      completionNotes: 'Removed approximately 4.5 cubic meters of solid silt and gravel. Water table dry.',
      materialsUsed: [{ item: 'Vacuum Gully Sucker Unit', quantity: '1 shift' }, { item: 'High Pressure Jetting Hose', quantity: '140 meters' }],
      submittedAt: new Date('2026-08-16T11:00:00Z'),
      reviewedAt: new Date('2026-08-16T15:30:00Z'),
      reviewedBy: engineerUser._id,
      engineerDecision: 'Approved',
      engineerComments: 'Before and after evidence verified. Video confirms clear culvert invert.',
      auditLog: [
        { action: 'CREATED', performedBy: 'Vikram Sengupta, P.E.', role: 'engineer', timestamp: new Date('2026-08-14T17:00:00Z') },
        { action: 'SUBMITTED', performedBy: 'Ramesh Kumar', role: 'field_worker', timestamp: new Date('2026-08-16T11:00:00Z') },
        { action: 'APPROVED', performedBy: 'Vikram Sengupta, P.E.', role: 'engineer', timestamp: new Date('2026-08-16T15:30:00Z') }
      ],
      createdAt: new Date('2026-08-14T17:00:00Z')
    },
    {
      workOrderId: 'WO-2026-002',
      assetId: 'DR-001',
      linkedComplaintIds: ['CMP-2026-0045'],
      problemDescription: 'Emergency re-cleaning requested after recurring overflow complaint CMP-2026-0045.',
      assignedTo: workerUser._id,
      assignedWorkerName: 'Ramesh Kumar (Zone 4 Field Team)',
      assignedTeam: 'Zone 4 Field Maintenance Squad B',
      priority: 'Urgent',
      repairType: 'Drain De-silting & Cleaning',
      status: 'Approved',
      closureAuditorStatus: 'Approved',
      closureAuditorFlags: [],
      beforeEvidence: [{ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', caption: 'Standing water with minor fresh leaf litter', type: 'photo', timestamp: new Date('2026-09-03T08:30:00Z') }],
      afterEvidence: [{ url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80', caption: 'Jetting completed', type: 'photo', timestamp: new Date('2026-09-04T10:15:00Z') }],
      videoEvidence: [pastVideo2._id],
      completionNotes: 'Re-flushed full 140m run. Minimal debris found, indicating issue is not localized blockage in this segment.',
      materialsUsed: [{ item: 'Water Jetting Tanker', quantity: '2 loads' }],
      submittedAt: new Date('2026-09-04T10:30:00Z'),
      reviewedAt: new Date('2026-09-04T14:10:00Z'),
      reviewedBy: engineerUser._id,
      engineerDecision: 'Approved',
      engineerComments: 'Approved, but flagged concern: local cleaning did not find sufficient debris to explain backwater.',
      auditLog: [
        { action: 'CREATED', performedBy: 'Vikram Sengupta, P.E.', role: 'engineer', timestamp: new Date('2026-09-02T19:00:00Z') },
        { action: 'APPROVED', performedBy: 'Vikram Sengupta, P.E.', role: 'engineer', timestamp: new Date('2026-09-04T14:10:00Z') }
      ],
      createdAt: new Date('2026-09-02T19:00:00Z')
    },
    // The Active Work Order for the live hackathon demonstration scenario!
    {
      workOrderId: 'WO-2026-003',
      assetId: 'DR-001',
      linkedComplaintIds: ['CMP-2026-0089', 'CMP-2026-0090'],
      problemDescription: 'Execute comprehensive de-silting and submit multi-stage LiveWork Proof video evidence. Document downstream invert flow.',
      assignedTo: workerUser._id,
      assignedWorkerName: 'Ramesh Kumar (Zone 4 Field Team)',
      assignedTeam: 'Zone 4 Field Maintenance Squad B',
      priority: 'Urgent',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      repairType: 'Drain De-silting & Cleaning',
      status: 'Assigned',
      closureAuditorStatus: 'Incomplete',
      closureAuditorFlags: [
        {
          code: 'MISSING_BEFORE_EVIDENCE',
          rule: 'Pre-repair baseline documentation mandatory',
          message: 'Before-work photographs or baseline condition records are missing.',
          severity: 'warning'
        },
        {
          code: 'MISSING_AFTER_EVIDENCE',
          rule: 'Post-repair condition proof mandatory',
          message: 'Post-repair/after-cleaning photographs proving clear culvert/drain invert are missing.',
          severity: 'error'
        },
        {
          code: 'MISSING_VIDEO_PROOF',
          rule: 'LiveWork Proof video mandatory',
          message: 'Task-specific walkthrough or live-recorded video evidence has not been submitted.',
          severity: 'error'
        },
        {
          code: 'REPEAT_FAILURE_PATTERN',
          rule: 'Asset history indicates recurring failure within 60-day window',
          message: 'Asset DR-001 has experienced 3 recurring overflow events after prior cleanings. Engineer review advised.',
          severity: 'warning'
        }
      ],
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
      completionNotes: '',
      materialsUsed: [],
      engineerDecision: 'Pending Review',
      auditLog: [
        {
          action: 'CREATED_AND_ASSIGNED',
          performedBy: 'Vikram Sengupta, P.E.',
          role: 'engineer',
          note: 'Assigned work order following repeat complaint CMP-2026-0089. LiveWork Proof mandatory.',
          newStatus: 'Assigned',
          timestamp: new Date('2026-10-10T14:00:00Z')
        }
      ],
      createdAt: new Date('2026-10-10T14:00:00Z')
    },
    {
      workOrderId: 'WO-2026-004',
      assetId: 'CL-004',
      linkedComplaintIds: [],
      problemDescription: 'De-block culvert inlet and clear debris grates along Market Road crossing.',
      assignedTo: workerUser._id,
      assignedWorkerName: 'Ramesh Kumar (Zone 4 Field Team)',
      assignedTeam: 'Zone 4 Field Maintenance Squad B',
      priority: 'High',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      repairType: 'Culvert Flume Clearing',
      status: 'In Progress',
      closureAuditorStatus: 'Incomplete',
      closureAuditorFlags: [
        {
          code: 'MISSING_AFTER_EVIDENCE',
          rule: 'Post-repair condition proof mandatory',
          message: 'Post-clearing photographic evidence has not been submitted yet.',
          severity: 'error'
        }
      ],
      requiredEvidenceChecklist: {
        beforePhotoRequired: true,
        duringPhotoRequired: true,
        afterPhotoRequired: true,
        videoProofRequired: false,
        completionNoteRequired: true
      },
      beforeEvidence: [
        {
          url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
          caption: 'Baseline inlet choked with plastic debris and tree branches',
          type: 'photo',
          timestamp: new Date(Date.now() - 3 * 3600 * 1000)
        }
      ],
      duringEvidence: [],
      afterEvidence: [],
      videoEvidence: [],
      completionNotes: 'Crew active on site with jetting unit. Partial flow restored.',
      materialsUsed: [{ item: 'High Pressure Water Tanker', quantity: '1 Load' }],
      auditLog: [
        {
          action: 'STARTED_WORK',
          performedBy: 'Ramesh Kumar',
          role: 'field_worker',
          note: 'Crew deployed on site and initiated high-pressure flume jetting.',
          previousStatus: 'Assigned',
          newStatus: 'In Progress',
          timestamp: new Date(Date.now() - 2 * 3600 * 1000)
        }
      ],
      createdAt: new Date(Date.now() - 24 * 3600 * 1000)
    }
  ]);

  // Pre-seed an Inspection for DR-001
  await Inspection.create({
    inspectionId: 'INS-2026-001',
    assetId: 'DR-001',
    inspectorName: 'Vikram Sengupta, P.E.',
    inspectorId: engineerUser._id,
    inspectionType: 'Routine Maintenance Check',
    date: new Date('2026-08-10T10:00:00Z'),
    findings: {
      debrisLevel: 'Moderate',
      structuralIntegrity: 'Sound',
      downstreamFlowClear: false,
      siltDepthCm: 18,
      waterVelocityMps: 0.35,
      notes: 'Culvert box structurally intact. Invert velocity notably low despite nominal slope.'
    },
    photos: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'],
    recommendation: {
      actionRequired: true,
      suggestedRepairType: 'Drain De-silting & Cleaning',
      urgency: 'High'
    }
  });

  // Pre-seed Root-Cause Investigation for DR-001
  await Investigation.create({
    investigationId: 'INV-2026-001',
    assetId: 'DR-001',
    triggerReason: 'Repeat overflow complaints within 60-day observation window following cleaning work order',
    status: 'Active Investigation',
    hypotheses: [
      {
        cause: 'Downstream obstruction',
        supportingEvidence: [
          'Asset DR-001 received 2 drain cleanings, yet overflow recurred 3 times within observation period.',
          'No verified downstream CCTV or manhole inspection recorded in asset history.',
          'Connected downstream receiver trunk is DR-002 (Railway Culvert Underpass).'
        ],
        contradictingEvidence: [],
        confidenceScore: 88,
        evidenceCitationRecords: ['WorkOrder:WO-2026-001', 'WorkOrder:WO-2026-002', 'Complaint:CMP-2026-0012', 'Complaint:CMP-2026-0045']
      },
      {
        cause: 'Insufficient drainage capacity',
        supportingEvidence: [
          'Current hydraulic cross-section capacity ratio is 0.62, below 0.75 design threshold.',
          '2 localized storm events exceeded 45mm precipitation.'
        ],
        contradictingEvidence: ['Local shop owners report backflow occurs even under modest 25mm rain showers.'],
        confidenceScore: 72,
        evidenceCitationRecords: ['Rainfall:MET-04:2026-08-14', 'Rainfall:MET-04:2026-09-02']
      },
      {
        cause: 'Repeated debris blockage',
        supportingEvidence: ['Commercial avenue generates high plastic packaging runoff.'],
        contradictingEvidence: ['WO-2026-002 completion notes recorded minimal debris in drain bed.'],
        confidenceScore: 35,
        evidenceCitationRecords: ['WorkOrder:WO-2026-002']
      }
    ],
    recommendedNextInspection: {
      suggestedAction: 'Perform Downstream CCTV Camera Probe on culvert segment extending 50m downstream of DR-001 towards DR-002 (Railway Feeder Junction).',
      missingEvidence: 'No downstream CCTV probe or manhole invert level survey within the last 120 days.',
      hypothesesDistinguished: ['Downstream obstruction', 'Insufficient drainage capacity', 'Repeated debris blockage'],
      expectedBenefit: 'Confirms whether water backing up into DR-001 is caused by a choke downstream, preventing costly repetitive surface cleaning.',
      priority: 'Urgent',
      status: 'Pending',
      recommendedAt: new Date('2026-10-11T10:00:00Z')
    },
    repeatFailureRiskScore: 84.5,
    aiConfidence: 88.0,
    engineerFeedback: {
      conclusion: '',
      reviewedBy: '',
      actionTaken: ''
    }
  });

  // Seed Sample Evidence Records with Authenticity Screening
  const ev1 = await Evidence.create({
    evidenceId: 'EVD-2026-00101',
    complaintId: 'CMP-2026-0089',
    fileUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    storagePath: 'uploads/photos/demo-overflow-1.jpg',
    originalFilename: 'field_evidence_storm_overflow.jpg',
    fileSize: 1845200,
    mimeType: 'image/jpeg',
    dimensions: { width: 1920, height: 1080 },
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    perceptualHash: 'e4f1a239c87d65b1',
    magicBytesValidated: true,
    exifStripped: true,
    screeningResult: {
      status: 'No obvious issue detected',
      signals: [
        'Cryptographic binary magic signature matches declared format (JPEG)',
        'Resolution verified: 1920x1080',
        'Context screening: waterlogging/overflow patterns identified',
        'Sensitive camera serials and exact home GPS coordinates stripped from public view'
      ],
      confidenceScore: 92,
      detectorVersion: 'v2.1-integrity-screening-engine',
      screenedAt: new Date('2026-10-10T12:31:00Z')
    },
    uploadedBy: 'Karthik Narayanan',
    uploadedByRole: 'citizen'
  });

  // Seed Tamper-Evident Chained Events for CMP-2026-0089
  await recordEvent({
    complaintId: 'CMP-2026-0089',
    eventType: 'COMPLAINT_CREATED',
    actorName: 'Karthik Narayanan',
    actorRole: 'citizen',
    changeSummary: 'Registered complaint CMP-2026-0089 (Overflow / Waterlogging) at 12th Cross, MG Avenue',
    newStatus: 'SUBMITTED',
    details: { category: 'Overflow / Waterlogging', severity: 'High' }
  });

  await recordEvent({
    complaintId: 'CMP-2026-0089',
    eventType: 'EVIDENCE_UPLOADED',
    actorName: 'Karthik Narayanan',
    actorRole: 'citizen',
    changeSummary: 'Uploaded field photograph EVD-2026-00101 with cryptographic SHA-256 hash',
    details: { evidenceId: 'EVD-2026-00101', sha256: ev1.sha256Hash }
  });

  await recordEvent({
    complaintId: 'CMP-2026-0089',
    eventType: 'EVIDENCE_SCREENED',
    actorName: 'Evidence Authenticity Screening Pipeline',
    actorRole: 'system',
    changeSummary: 'Completed multi-layer verification: No obvious issue detected (Confidence: 92%)',
    details: { outcome: 'No obvious issue detected', detectorVersion: 'v2.1' }
  });

  await recordEvent({
    complaintId: 'CMP-2026-0089',
    eventType: 'STATUS_CHANGED',
    actorName: 'Vikram Sengupta, P.E.',
    actorRole: 'engineer',
    changeSummary: 'Triage reviewed and assigned to Zone 4 Stormwater Maintenance Division',
    previousStatus: 'SUBMITTED',
    newStatus: 'ASSIGNED',
    details: { assignedDepartment: 'Zone 4 Stormwater Maintenance Division' }
  });

  await recordEvent({
    complaintId: 'CMP-2026-0089',
    eventType: 'WORK_ORDER_LINKED',
    actorName: 'Vikram Sengupta, P.E.',
    actorRole: 'engineer',
    changeSummary: 'Consolidated with urgent maintenance work order WO-2026-003',
    details: { workOrderId: 'WO-2026-003' }
  });

  // Seed Audit Logs
  await AuditLog.create([
    {
      action: 'SYSTEM_BOOTSTRAP',
      performedBy: 'system',
      userRole: 'system',
      entityType: 'System',
      entityId: 'SYS-INIT',
      details: { environment: 'Development/Hackathon Demo', syntheticAssetsCount: assetSpecs.length }
    },
    {
      action: 'ASSET_FLAGGED_REPEAT_FAILURE',
      performedBy: 'system',
      userRole: 'system',
      entityType: 'Asset',
      entityId: 'DR-001',
      details: { reason: '3 repeat overflow complaints within 60-day window' }
    }
  ]);

  // Seed sample citizen notifications
  await Notification.create([
    {
      recipientUserId: citizenUser._id,
      recipientEmail: citizenUser.email,
      complaintId: 'CMP-2026-0089',
      title: 'Work Order Linked',
      message: 'Your report CMP-2026-0089 has been consolidated into priority maintenance work order WO-2026-003.',
      type: 'WORK_UPDATE',
      link: '/track/CMP-2026-0089',
      createdAt: new Date('2026-10-12T10:00:00Z')
    },
    {
      recipientUserId: citizenUser._id,
      recipientEmail: citizenUser.email,
      complaintId: 'CMP-2026-0089',
      title: 'Investigation Authorized',
      message: 'Municipal Engineer authorized CCTV inspection on downstream culvert DR-002 based on recurring overflow pattern.',
      type: 'INSPECTION_SCHEDULED',
      link: '/track/CMP-2026-0089',
      createdAt: new Date('2026-10-13T14:30:00Z')
    },
    {
      recipientUserId: citizenUser._id,
      recipientEmail: citizenUser.email,
      complaintId: 'CMP-2026-0045',
      title: 'Repair Verification Needed',
      message: 'Zone 4 field squad marked emergency de-silting complete. Please submit post-repair feedback if issue persists.',
      type: 'EVIDENCE_REVIEW',
      link: '/track/CMP-2026-0045',
      createdAt: new Date('2026-09-03T09:00:00Z')
    },
    // Seed field worker notifications
    {
      recipientUserId: workerUser._id,
      recipientEmail: workerUser.email,
      workOrderId: 'WO-2026-003',
      title: 'Priority Work Order Assigned',
      message: 'You have been assigned urgent work order WO-2026-003 for Drain De-silting on asset DR-001. LiveWork Proof video is required.',
      type: 'WORK_ORDER_ASSIGNED',
      link: '/worker/tasks/WO-2026-003',
      createdAt: new Date('2026-10-10T14:05:00Z')
    },
    {
      recipientUserId: workerUser._id,
      recipientEmail: workerUser.email,
      workOrderId: 'WO-2026-004',
      title: 'Active Task: Market Road Culvert',
      message: 'Work order WO-2026-004 is currently in progress. Please ensure post-clearing flow test photos are uploaded before shift end.',
      type: 'WORK_UPDATE',
      link: '/worker/tasks/WO-2026-004',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000)
    },
    {
      recipientUserId: workerUser._id,
      recipientEmail: workerUser.email,
      title: 'Safety Weather Advisory',
      message: 'High precipitation forecast for Ward 4 today. Exercise extreme caution and do not enter confined box drains if water depth exceeds 20cm.',
      type: 'WEATHER_ALERT',
      link: '/worker/check-in',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000)
    },
    // Seed Municipal Engineer notifications
    {
      recipientUserId: engineerUser._id,
      recipientEmail: engineerUser.email,
      workOrderId: 'WO-2026-003',
      title: 'Work Order Awaiting Engineer Sign-Off',
      message: 'Field squad submitted repair evidence for WO-2026-003 (DR-001). Closure Auditor evaluation: Incomplete (Missing LiveWork video proof).',
      type: 'EVIDENCE_REVIEW',
      link: '/work-orders/WO-2026-003',
      createdAt: new Date(Date.now() - 1 * 3600 * 1000)
    },
    {
      recipientUserId: engineerUser._id,
      recipientEmail: engineerUser.email,
      complaintId: 'CMP-2026-0089',
      title: 'Recurring Drain Failure Alert: DR-001',
      message: 'Asset DR-001 exceeded repeat failure threshold (3 overflow incidents within 60 days). Evidence-Gap Engine recommends Downstream CCTV Camera Probe.',
      type: 'REPEAT_FAILURE_TRIGGER',
      link: '/investigations',
      createdAt: new Date(Date.now() - 6 * 3600 * 1000)
    },
    {
      recipientUserId: engineerUser._id,
      recipientEmail: engineerUser.email,
      complaintId: 'CMP-2026-0045',
      title: 'Citizen Recurrence Dispute Filed',
      message: 'Citizen reopened complaint CMP-2026-0045 noting persistent localized waterlogging 4 days post-clearance. Action required.',
      type: 'DISPUTE_UPDATE',
      link: '/complaints',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000)
    },
    {
      recipientUserId: engineerUser._id,
      recipientEmail: engineerUser.email,
      title: 'Monsoon Preparedness Hydro Alert',
      message: 'Ward 4 Hydro-Met station recorded 52mm precipitation. 4 downstream arterial canals operating at >80% capacity.',
      type: 'WEATHER_ALERT',
      link: '/analytics',
      createdAt: new Date(Date.now() - 18 * 3600 * 1000)
    }
  ]);

  console.log('[Seeder] Database successfully seeded with 22 assets and complete DR-001 demonstration scenario!');
};

module.exports = { seedDatabase };

if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      console.log('[Seeder] Done. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seeder] Error:', err);
      process.exit(1);
    });
}
