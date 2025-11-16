const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: String,
    lastName: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastInteraction: {
      type: Date,
      default: Date.now,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    tags: [String],
    metadata: {
      firstMessageDate: {
        type: Date,
        default: Date.now,
      },
      preferredNetwork: String,
      preferredService: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ isActive: 1, isBlocked: 1 });
userSchema.index({ lastInteraction: -1 });

module.exports = mongoose.model("User", userSchema);
