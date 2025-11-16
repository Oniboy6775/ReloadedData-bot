const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const { markAsRead } = require("../utils/whatsappHelper");

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Webhook verification (GET)
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Webhook verification failed");
    res.status(403).send("Forbidden");
  }
});

// Webhook to receive messages (POST)
router.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // Quick response to Facebook
    res.status(200).send("EVENT_RECEIVED");

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (value.messages && value.messages[0]) {
        const message = value.messages[0];
        const from = message.from;
        const messageId = message.id;
        const messageType = message.type;

        let messageBody = "";
        let buttonId = null;

        if (messageType === "text") {
          messageBody = message.text.body;
        } else if (messageType === "interactive") {
          if (message.interactive.type === "button_reply") {
            buttonId = message.interactive.button_reply.id;
            messageBody = message.interactive.button_reply.title;
          } else if (message.interactive.type === "list_reply") {
            buttonId = message.interactive.list_reply.id;
            messageBody = message.interactive.list_reply.title;
          }
        }

        console.log(`📨 Message from ${from}: ${messageBody || buttonId}`);

        await markAsRead(messageId);
        await conversationController.handleMessage(
          from,
          messageBody,
          messageType,
          buttonId
        );
      }

      if (value.statuses && value.statuses[0]) {
        const status = value.statuses[0];
        console.log(`📊 Message status: ${status.status} for ${status.id}`);
      }
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
  }
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    webhook: "active",
  });
});

module.exports = router;
