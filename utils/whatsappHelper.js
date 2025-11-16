const axios = require("axios");

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
let PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID_TEST;
if (process.env.NODE_ENV === "production") {
  PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID_LIVE;
}
const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
  console.warn(
    "WHATSAPP_ACCESS_TOKEN or PHONE_NUMBER_ID is not set in environment variables"
  );
}
async function sendWhatsAppMessage(to, message) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Message sent successfully");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error sending message:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function sendInteractiveButtons(to, bodyText, buttons) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: {
            buttons: buttons,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Interactive buttons sent");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error sending buttons:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function sendInteractiveList(to, bodyText, buttonText, sections) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: bodyText },
          action: {
            button: buttonText,
            sections: sections,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Interactive list sent");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error sending list:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function markAsRead(messageId) {
  try {
    await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
        typing_indicator: {
          type: "text",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "❌ Error marking as read:",
      error.response?.data || error.message
    );
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  markAsRead,
};
