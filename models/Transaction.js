const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userPhone: {
      type: String,
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: ["DATA", "AIRTIME", " WIFI"],
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    recipientNumber: {
      type: String,
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    paymentConfirmedAt: Date,
    completedAt: Date,
    providerResponse: Object,
    failureReason: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
