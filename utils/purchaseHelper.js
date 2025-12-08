//create a class purchaseHelper that have different methods to handle purchase logic like buyData,buyAirtime etc
require("dotenv").config();
const axios = require("axios");
const Voucher = require("../models/Voucher");

const { SUPPLIER_API, SUPPLIER_API_KEY } = process.env;
const handlePurchase = async ({
  network,
  amount,
  planId,
  phoneNumber,
  serviceType,
  wifiLocation,
  from,
}) => {
  console.log({ serviceType, network, amount, planId, phoneNumber });

  try {
    switch (serviceType) {
      case "AIRTIME":
        return await buyAirtime({ phoneNumber, amount, network });
      case "DATA":
        return await buyData({ phoneNumber, network, amount, planId });
      case "WIFI":
        return await purchaseWifiVoucher({ planId, wifiLocation, from });
      default:
        break;
    }
  } catch (err) {
    console.error("Error in handlePurchase:", err);
  }
};
const buyData = async ({ phoneNumber, network, planId }) => {
  let response = { status: false, msg: "Purchase failed" };
  try {
    const { data } = await axios.post(
      `${SUPPLIER_API}/buy/data`,
      {
        network: network,
        plan: planId,
        mobile_number: phoneNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${SUPPLIER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    response.status = true;
    response.msg = data?.msg || "Purchase successful";
    return response;
  } catch (error) {
    response.msg = error.response?.data?.msg;
    return response;
  }
};
const buyAirtime = async ({ phoneNumber, amount, network }) => {
  //logic to buy airtime
  let response = { status: false, msg: "Airtime purchase failed" };
  try {
    const { data } = await axios.post(
      `${SUPPLIER_API}/buy/airtime`,
      {
        mobile_number: phoneNumber,
        amount,
        network,
      },
      {
        headers: {
          Authorization: `Bearer ${SUPPLIER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(data?.msg || data);
    response.status = true;
    response.msg = data?.msg || "Airtime purchase successful";
    return response;
  } catch (error) {
    response.msg = error.response?.data?.msg;
    return response;
  }
};
const purchaseWifiVoucher = async ({ planId, wifiLocation, from }) => {
  //logic to purchase wifi voucher
  let response = { status: false, msg: "WiFi voucher purchase failed" };
  console.log({ planId, wifiLocation, from });

  try {
    const voucher = await Voucher.findOneAndUpdate(
      { profileName: planId, voucherLocation: wifiLocation, used: false },
      { used: true, usedBy: from, usedAt: new Date() },
      { new: true }
    );
    console.log({ voucher });
    if (voucher) {
      response.status = true;
      response.msg = `*${voucher.voucherCode}*`;
    } else {
      response.msg = "No available vouchers for the selected plan";
    }
    return response;
  } catch (error) {
    response.msg = error.message;
    return response;
  }
};
module.exports = { handlePurchase };
