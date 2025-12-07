const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentStep: {
      type: String,
      enum: [
        "START",
        "SERVICE_TYPE",
        "LOCATION_SELECTION",
        "NETWORK",
        "PHONE_NUMBER",
        "PLAN_SELECTION",
        "PAYMENT",
        "CONFIRMATION",
        "COMPLETED",
      ],
      default: "START",
    },
    serviceType: {
      type: String,
      enum: ["DATA", "AIRTIME", "WIFI"],
    },
    network: {
      type: String,
      enum: ["MTN", "AIRTEL", "GLO", "9MOBILE"],
    },
    recipientNumber: String,
    selectedPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    selectedWifiPlan: String,
    wifiLocation: {
      type: String,
      enum: ["malete"],
    },
    amount: Number,
    paymentReference: String,
    paymentGatewayReference: String,

    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete conversations older than 24 hours
conversationSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("Conversation", conversationSchema);
