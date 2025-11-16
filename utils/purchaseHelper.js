//create a class purchaseHelper that have different methods to handle purchase logic like buyData,buyAirtime etc
require("dotenv").config();
const axios = require("axios");
const { SUPPLIER_API, SUPPLIER_API_KEY } = process.env;
const handlePurchase = async ({
  network,
  amount,
  planId,
  phoneNumber,
  serviceType,
}) => {
  console.log({ serviceType, network, amount, planId, phoneNumber });

  try {
    switch (serviceType) {
      case "AIRTIME":
        return await buyAirtime({ phoneNumber, amount, network });
      case "DATA":
        return await buyData({ phoneNumber, network, amount, planId });
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

module.exports = { handlePurchase };
