//create a voucher model
const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  profileName: {
    type: String,
    required: true,
    enum: ["1GB", "2GB", "3GB", "10GB", "20GB", "1HR"],
  },
  voucherLocation: { type: String, required: true, enum: ["malete"] },
  voucherCode: { type: String, required: true, unique: true },
  validity: { type: String, required: true },
  used: { type: Boolean, default: false },
  usedAt: { type: Date },
  usedBy: { type: String },
});

const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
// make the document delete after used true for 30 days
voucherSchema.index(
  { usedAt: 1 },
  { expireAfterSeconds: 2592000, partialFilterExpression: { used: true } }
);
// 2592000 seconds = 30 days
