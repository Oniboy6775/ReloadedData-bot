const axios = require("axios");
require("dotenv");
// const {
//   MONNIFY_URL_LIVE,
//   MONNIFY_CONTRACT_CODE_LIVE,
//   MONNIFY_API_ENCODED_LIVE,
// } = process.env;
let MONNIFY_URL_LIVE = process.env.MONNIFY_URL_LIVE;
let MONNIFY_CONTRACT_CODE_LIVE = process.env.MONNIFY_CONTRACT_CODE_LIVE;
let MONNIFY_API_ENCODED_LIVE = process.env.MONNIFY_API_ENCODED_LIVE;
if (process.env.NODE_ENV !== "production") {
  MONNIFY_URL_LIVE = process.env.MONNIFY_URL_TEST;
  MONNIFY_CONTRACT_CODE_LIVE = process.env.MONNIFY_CONTRACT_CODE_TEST;
  MONNIFY_API_ENCODED_LIVE = process.env.MONNIFY_API_ENCODED_TEST;
}
//get access token function from monnify
const getAccessToken = async () => {
  const options = {
    method: "POST",
    url: `${MONNIFY_URL_LIVE}/auth/login`,
    headers: {
      Authorization: `Basic ${MONNIFY_API_ENCODED_LIVE}`,
    },
  };

  try {
    const { data } = await axios.request(options);

    return data.responseBody.accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};

const initiatePayment = async ({
  paymentReference,
  email,
  description,
  amount,
  phoneNumber,
}) => {
  const accessToken = await getAccessToken();
  //   console.log({ accessToken });
  const options = {
    method: "POST",
    url: `${MONNIFY_URL_LIVE}/merchant/transactions/init-transaction       `,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: {
      amount: amount,
      customerEmail: email,
      paymentReference: paymentReference,
      paymentDescription: description,
      currencyCode: "NGN",
      contractCode: MONNIFY_CONTRACT_CODE_LIVE,
      redirectUrl: "https://my-merchants-page.com/transaction/confirm",
      paymentMethods: ["ACCOUNT_TRANSFER"],
      metadata: { phoneNumber: phoneNumber, name: phoneNumber },
    },
  };

  try {
    const { data } = await axios.request(options);
    // console.log(data);

    return {
      status: data.requestSuccessful,
      paymentUrl: data.responseBody.checkoutUrl,
      transactionReference: data.responseBody.transactionReference,
    };
  } catch (error) {
    console.error(error);
    return { status: false };
  }
};

const getPaymentAccountDetails = async (transactionReference) => {
  const accessToken = await getAccessToken();
  const options = {
    method: "POST",
    url: `${MONNIFY_URL_LIVE}/merchant/bank-transfer/init-payment`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: { transactionReference, bankCode: "058" },
  };

  try {
    const { data } = await axios.request(options);
    const response = {
      status: data.requestSuccessful,
      accountNumber: data.responseBody.accountNumber,
      accountName: data.responseBody.accountName,
      bankName: data.responseBody.bankName,
      usssdCode: data.responseBody?.usssdCode || "",
    };
    return response;
  } catch (error) {
    console.error("Error getting payment accounts:", error);
    return { status: false };
  }
};
//get payment status function
const getPaymentStatus = async (transactionReference) => {
  const accessToken = await getAccessToken();
  const options = {
    method: "GET",
    url: `${MONNIFY_URL_LIVE}/transactions/${encodeURIComponent(
      transactionReference
    )}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const { data } = await axios.request(options);
    // console.log(data.responseBody.paymentSessionDTOs);

    return {
      status: data.requestSuccessful,
      paymentStatus: data.responseBody.paymentStatus,
    };
  } catch (error) {
    console.error("Error getting payment status:", error);
    return { status: false };
  }
};
module.exports = {
  initiatePayment,
  getPaymentAccountDetails,
  getPaymentStatus,
};
