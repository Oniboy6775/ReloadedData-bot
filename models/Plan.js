const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    network: {
      type: String,
      enum: ["MTN", "AIRTEL", "GLO", "9MOBILE"],
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["DATA", "AIRTIME"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dataAmount: {
      type: String,
      required: function () {
        return this.serviceType === "DATA";
      },
    },
    validity: {
      type: String,
      default: "30 days",
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    providerCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

planSchema.index({ network: 1, serviceType: 1, isActive: 1 });

module.exports = mongoose.model("Plan", planSchema);
