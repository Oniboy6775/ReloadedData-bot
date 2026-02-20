const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Voucher = require("./models/Voucher");

const OUTPUT_DIR = path.join(__dirname, "vouchers");

const PROFILE_NAMES = ["1GB", "2GB", "3GB", "10GB", "20GB", "1HR"];

async function exportUnusedVouchers() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const profile of PROFILE_NAMES) {
    const vouchers = await Voucher.find(
      { profileName: profile, used: false },
      { voucherCode: 1, validity: 1, voucherLocation: 1, profileName: 1, _id: 0 }
    ).lean();

    const filePath = path.join(OUTPUT_DIR, `${profile}.csv`);
    const header = "profileName,voucherCode,validity,voucherLocation";
    const rows = vouchers.map(
      (v) =>
        `${v.profileName},${v.voucherCode},${v.validity},${v.voucherLocation}`
    );
    const csv = [header, ...rows].join("\n");

    fs.writeFileSync(filePath, csv, "utf8");
    console.log(`${profile}: ${vouchers.length} unused voucher(s) -> ${filePath}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

exportUnusedVouchers().catch((err) => {
  console.error(err);
  process.exit(1);
});
