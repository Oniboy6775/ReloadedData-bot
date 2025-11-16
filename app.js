const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes (we'll create these next)
const whatsappRoutes = require("./routes/whatsappWebhook");
const adminRoutes = require("./routes/adminRoutes");

// Mount routes
app.use("/api/v1/whatsapp", whatsappRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(
        `📱 Webhook URL: http://localhost:${PORT}/api/whatsapp/webhook`
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
//ngrok http --url=uncalmative-extranuclear-ingeborg.ngrok-free.dev 5000
app.get("/", (req, res) => {
  res.send("WhatsApp Webhook is running.");
});
module.exports = app;
