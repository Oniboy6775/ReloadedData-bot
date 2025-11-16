const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { sendWhatsAppMessage } = require("../utils/whatsappHelper");

// Get all users
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }
    if (req.query.isBlocked !== undefined) {
      filter.isBlocked = req.query.isBlocked === "true";
    }
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const users = await User.find(filter)
      .sort({ lastInteraction: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user statistics
router.get("/users/stats", async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      blockedUsers: await User.countDocuments({ isBlocked: true }),
      newUsersToday: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      newUsersThisWeek: await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      totalTransactions: await Transaction.countDocuments(),
      completedTransactions: await Transaction.countDocuments({
        status: "COMPLETED",
      }),
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message to single user
router.post("/broadcast/single", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "Phone number and message are required",
      });
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "User is blocked" });
    }

    await sendWhatsAppMessage(phoneNumber, message);

    res.json({
      success: true,
      message: "Message sent successfully",
      to: phoneNumber,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send bulk broadcast
router.post("/broadcast/bulk", async (req, res) => {
  try {
    const { message, filters } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const query = { isBlocked: false, isActive: true };

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters?.minPurchases) {
      query.totalPurchases = { $gte: filters.minPurchases };
    }

    if (filters?.minSpent) {
      query.totalSpent = { $gte: filters.minSpent };
    }

    const users = await User.find(query).select("phoneNumber");

    if (users.length === 0) {
      return res.json({
        success: true,
        message: "No users match the criteria",
        sent: 0,
      });
    }

    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (let i = 0; i < users.length; i++) {
      try {
        await sendWhatsAppMessage(users[i].phoneNumber, message);
        successCount++;
        results.push({ phoneNumber: users[i].phoneNumber, status: "sent" });

        if (i < users.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        failCount++;
        results.push({
          phoneNumber: users[i].phoneNumber,
          status: "failed",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Broadcast completed`,
      stats: {
        total: users.length,
        sent: successCount,
        failed: failCount,
      },
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get broadcast templates
router.get("/broadcast/templates", (req, res) => {
  const templates = [
    {
      id: "promo_discount",
      name: "Discount Promotion",
      message:
        '🎉 Special Offer! Get 20% OFF on all data plans today! Use code SAVE20 when you order. Valid for 24 hours only! Type "start" to order now.',
    },
    {
      id: "new_plans",
      name: "New Plans Available",
      message:
        '📱 New Data Plans Alert! We just added amazing new plans with better prices. Check them out by typing "start" now!',
    },
    {
      id: "thank_you",
      name: "Thank You Message",
      message:
        '❤️ Thank you for being a valued customer! We appreciate your business. Type "start" anytime you need data or airtime.',
    },
    {
      id: "weekend_special",
      name: "Weekend Special",
      message:
        '🌟 Weekend Special! Double data on selected plans this weekend only. Type "start" to see available offers!',
    },
  ];

  res.json({ success: true, data: templates });
});

module.exports = router;
