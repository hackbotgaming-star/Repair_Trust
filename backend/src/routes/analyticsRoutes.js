const express = require('express');
const router = express.Router();
const { computePlatformAnalytics } = require('../services/analyticsService');

// Get platform KPIs & repeat-failure metrics
router.get('/', async (req, res) => {
  try {
    const { observationWindowDays = 60 } = req.query;
    const analytics = await computePlatformAnalytics(observationWindowDays);
    return res.json({ success: true, data: analytics });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
