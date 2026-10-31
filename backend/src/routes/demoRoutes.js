const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../utils/seeder');

// Demo reset endpoint
router.post('/reset', async (req, res) => {
  try {
    await seedDatabase();
    return res.json({
      success: true,
      message: 'Demo dataset reset successfully! All 22 assets and the DR-001 scenario have been restored.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
