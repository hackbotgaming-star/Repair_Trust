const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
const { authenticate } = require('../../middleware/auth');

/**
 * GET /api/v1/notifications
 * Get notifications for authenticated citizen or user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const query = {
      $or: [
        { recipientUserId: req.user._id },
        { recipientEmail: req.user.email }
      ]
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false
    });

    return res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark single notification as read
 */
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    return res.json({ success: true, data: notif });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/v1/notifications/mark-all-read
 * Mark all notifications as read for current user
 */
router.post('/mark-all-read', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipientUserId: req.user._id },
          { recipientEmail: req.user.email }
        ],
        isRead: false
      },
      { isRead: true }
    );
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
