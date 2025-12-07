const csv = require("csvtojson");
const mongoose = require("mongoose");
const Voucher = require("./models/Voucher"); // Adjust the path as needed
require("dotenv").config();
csv()
  .fromFile("vouchers/1HR.csv") // the CSV file you want to convert
  .then((jsonObj) => {
    const formattedVouchers = jsonObj.map((item) => ({
      voucherCode: item.Username,
      profileName: item.Profile,
      validity: "30days",
      used: false,
      voucherLocation: "malete",
    }));

    console.log(formattedVouchers);
    mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(async () => {
        console.log("Connected to MongoDB");

        try {
          await Voucher.insertMany(formattedVouchers);
          console.log("Vouchers uploaded successfully!");
        } catch (err) {
          console.error("Error uploading vouchers:", err);
        } finally {
          mongoose.connection.close();
        }
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
      });
  });
