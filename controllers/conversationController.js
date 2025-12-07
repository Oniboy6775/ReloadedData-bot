const Conversation = require("../models/Conversation");
const Plan = require("../models/Plan");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const {
  initiatePayment,
  getPaymentAccountDetails,
  getPaymentStatus,
} = require("../utils/paymentHelper");
const { handlePurchase } = require("../utils/purchaseHelper");
const {
  sendWhatsAppMessage,
  sendInteractiveButtons,
  sendInteractiveList,
} = require("../utils/whatsappHelper");
const { BUSINESS_NAME, BUSINESS_WEBSITE, BUSINESS_CHANNEL, BOT_EMAIL } =
  process.env;
class ConversationController {
  async handleMessage(
    from,
    messageBody,
    messageType = "text",
    buttonId = null,
    senderName
  ) {
    try {
      // Save or update user
      await this.saveUser({ phoneNumber: from, senderName });
      // Get or create conversation state
      let conversation = await Conversation.findOne({ phoneNumber: from });

      if (!conversation) {
        conversation = await Conversation.create({
          phoneNumber: from,
          currentStep: "START",
        });
      }

      // Update last activity
      conversation.lastActivity = new Date();
      await conversation.save();

      // Handle button response if it's an interactive message
      const userInput = buttonId || messageBody.trim();
      if (userInput.toLowerCase() === "restart") {
        conversation.currentStep = "START";
        await conversation.save();
      }
      // Route to appropriate handler based on current step
      switch (conversation.currentStep) {
        case "START":
          await this.handleStart(from, conversation, senderName);
          break;

        case "SERVICE_TYPE":
          await this.handleServiceType(from, conversation, userInput);
          break;

        case "LOCATION_SELECTION":
          await this.handleLocationSelection(from, conversation, userInput);
          break;
        case "NETWORK":
          await this.handleNetwork(from, conversation, userInput);
          break;

        case "PHONE_NUMBER":
          await this.handlePhoneNumber(from, conversation, userInput);
          break;

        case "PLAN_SELECTION":
          await this.handlePlanSelection(from, conversation, userInput);
          break;

        case "PAYMENT":
          await this.handlePaymentConfirmation(
            from,
            conversation,
            userInput,
            senderName
          );
          break;

        default:
          await this.handleStart(from, conversation);
      }
    } catch (error) {
      console.error("❌ Error in conversation handler:", error);
      await sendWhatsAppMessage(
        from,
        'Sorry, something went wrong. Please type "start" to begin again.'
      );
    }
  }

  async saveUser({ phoneNumber, senderName }) {
    try {
      const user = await User.findOne({ phoneNumber });

      if (user) {
        user.lastInteraction = new Date();
        user.isActive = true;
        user.name = senderName;
        await user.save();
      } else {
        await User.create({
          phoneNumber,
          isActive: true,
          name: senderName,
          lastInteraction: new Date(),
        });
        console.log(`✅ New user saved: ${phoneNumber}`);
      }
    } catch (error) {
      console.error("❌ Error saving user:", error);
    }
  }

  async updateUserStats(phoneNumber, amount, serviceType, network) {
    try {
      await User.findOneAndUpdate(
        { phoneNumber },
        {
          $inc: { totalPurchases: 1, totalSpent: amount },
          $set: {
            "metadata.preferredService": serviceType,
            "metadata.preferredNetwork": network,
          },
        }
      );
    } catch (error) {
      console.error("❌ Error updating user stats:", error);
    }
  }

  async handleStart(from, conversation, senderName) {
    let WELCOME_MESSAGE = `Hello ${senderName},\n\nWelcome to *${BUSINESS_NAME}* 🎉\n\nWhat would you like to purchase today?  \n\n*Official Website*\n_${BUSINESS_WEBSITE}_ \n\n*Support channel*\n${BUSINESS_CHANNEL}`;

    const buttons = [
      {
        type: "reply",
        reply: {
          id: "DATA",
          title: "📱 Data",
        },
      },
      {
        type: "reply",
        reply: {
          id: "AIRTIME",
          title: "💳 Airtime",
        },
      },
      {
        type: "reply",
        reply: {
          id: "WIFI",
          title: "🛜 Wifi voucher",
        },
      },
    ];

    await sendInteractiveButtons(from, WELCOME_MESSAGE, buttons);

    conversation.currentStep = "SERVICE_TYPE";
    await conversation.save();
  }

  async handleServiceType(from, conversation, userInput) {
    const input = userInput.toUpperCase();

    if (input === "DATA" || input === "1") {
      conversation.serviceType = "DATA";
    } else if (input === "AIRTIME" || input === "2") {
      conversation.serviceType = "AIRTIME";
    } else if (input === "WIFI" || input === "3") {
      conversation.serviceType = "WIFI";
    } else {
      await sendWhatsAppMessage(
        from,
        "☹️ Please select a valid option: Reply *1* for Data , *2* for Airtime or *3* for wifi voucher"
      );
      return;
    }

    await conversation.save();
    // if conversation service type is wifi , allow to select wifi location as the network

    if (conversation.serviceType === "WIFI") {
      const sections = [
        {
          title: `Wifi Locations`,
          rows: [{ id: "malete", title: "Malete(Al-Ibanah)" }],
        },
      ];

      await sendInteractiveList(
        from,
        `Great! You selected ${conversation.serviceType}.\n\nWhich wifi Location?`,
        "View Wifi Locations",
        sections
      );

      conversation.currentStep = "LOCATION_SELECTION";
      await conversation.save();
      return;
    } else {
      const buttons = [
        {
          type: "reply",
          reply: { id: "MTN", title: "MTN" },
        },
        {
          type: "reply",
          reply: { id: "AIRTEL", title: "Airtel" },
        },
        {
          type: "reply",
          reply: { id: "GLO", title: "Glo" },
        },
      ];

      await sendInteractiveButtons(
        from,
        `Great! You selected ${conversation.serviceType}.\n\nWhich network provider?`,
        buttons
      );

      await sendWhatsAppMessage(from, 'Or reply "4" for 9Mobile');

      conversation.currentStep = "NETWORK";
      await conversation.save();
    }
  }
  async handleLocationSelection(from, conversation, userInput) {
    const input = userInput.toLowerCase();
    const locationMap = {
      malete: "malete",
      1: "malete",
    };
    console.log(conversation.currentStep);

    const location = locationMap[input];

    if (!location) {
      await sendWhatsAppMessage(
        from,
        "Please select a valid wifi location: Malete"
      );
      return;
    }

    const availableWifiPlans = [
      { plan: "1GB", price: 200, validity: "30 days", id: "plan1" },
      { plan: "2GB", price: 350, validity: "30 days", id: "plan2" },
      { plan: "3GB", price: 500, validity: "30 days", id: "plan3" },
      { plan: "10GB", price: 1200, validity: "30 days", id: "plan4" },
      { plan: "20GB", price: 2000, validity: "30 days", id: "plan5" },
      { plan: "1HR", price: 1500, validity: "30 days", id: "plan6" },
    ];
    const sections = [
      {
        title: `Voucher at ${location}`,
        rows: availableWifiPlans.map((plan) => ({
          id: plan.id,
          title: `${plan.plan} - ₦${plan.price.toLocaleString()}`,
          description: `Validity: ${plan.validity}`,
        })),
      },
    ];

    await sendInteractiveList(
      from,
      `Great! Location confirmed: ${location}\n\nSelect your preferred wifi plan:`,
      "View Wifi Plans",
      sections
    );
    conversation.wifiLocation = location?.toLowerCase();
    conversation.currentStep = "PLAN_SELECTION";
    await conversation.save();
  }

  async handleNetwork(from, conversation, userInput) {
    const input = userInput.toUpperCase();
    const networkMap = {
      MTN: "MTN",
      1: "MTN",
      AIRTEL: "AIRTEL",
      2: "AIRTEL",
      GLO: "GLO",
      3: "GLO",
      "9MOBILE": "9MOBILE",
      4: "9MOBILE",
    };

    const network = networkMap[input];

    if (!network) {
      await sendWhatsAppMessage(
        from,
        "Please select a valid network: MTN, Airtel, Glo, or 9Mobile"
      );
      return;
    }

    conversation.network = network;
    conversation.currentStep = "PHONE_NUMBER";
    await conversation.save();

    await sendWhatsAppMessage(
      from,
      `Perfect! ${network} selected.\n\nPlease enter the phone number to receive the ${conversation.serviceType.toLowerCase()}:\n\nExample: 08012345678`
    );
  }

  async handlePhoneNumber(from, conversation, userInput) {
    const phoneRegex = /^0[7-9][0-1]\d{8}$/;
    const cleanedNumber = userInput.replace(/\s+/g, "");

    if (!phoneRegex.test(cleanedNumber)) {
      await sendWhatsAppMessage(
        from,
        "Invalid phone number format. Please enter a valid Nigerian number:\n\nExample: 08012345678"
      );
      return;
    }

    conversation.recipientNumber = cleanedNumber;
    conversation.currentStep = "PLAN_SELECTION";
    await conversation.save();

    const plans = await Plan.find({
      network: conversation.network,
      serviceType: conversation.serviceType,
      isActive: true,
    }).sort({ price: 1 });

    if (plans.length === 0) {
      await sendWhatsAppMessage(
        from,
        "Sorry, no plans available at the moment. Please try again later."
      );
      conversation.currentStep = "START";
      await conversation.save();
      return;
    }

    const sections = [
      {
        title: `${conversation.network} ${conversation.serviceType} Plans`,
        rows: plans.map((plan) => ({
          id: plan._id.toString(),
          title: plan.name,
          description: `₦${plan.price.toLocaleString()}${
            plan.dataAmount ? ` - ${plan.dataAmount}` : ""
          }`,
        })),
      },
    ];

    await sendInteractiveList(
      from,
      `Great! Number confirmed: ${cleanedNumber}\n\nSelect your preferred plan:`,
      "View Plans",
      sections
    );
  }

  async handlePlanSelection(from, conversation, userInput) {
    const availableWifiPlans = [
      { plan: "1GB", price: 200, validity: "30 days", id: "plan1" },
      { plan: "2GB", price: 350, validity: "30 days", id: "plan2" },
      { plan: "3GB", price: 500, validity: "30 days", id: "plan3" },
      { plan: "10GB", price: 1200, validity: "30 days", id: "plan4" },
      { plan: "20GB", price: 2000, validity: "30 days", id: "plan5" },
      { plan: "1HR", price: 1500, validity: "30 days", id: "plan6" },
    ];
    if (conversation.serviceType === "WIFI") {
      const selectedPlan = availableWifiPlans.find(
        (plan) => plan.id === userInput.toLowerCase()
      );
      console.log(selectedPlan);

      if (!selectedPlan) {
        await sendWhatsAppMessage(
          from,
          "Invalid plan selection. Please select from the list."
        );
        return;
      }
      conversation.selectedWifiPlan = selectedPlan.plan;
      conversation.amount = selectedPlan.price;
      await conversation.save();
      conversation.currentStep = "PAYMENT";
      await conversation.save();

      const paymentRef = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

      await Transaction.create({
        userPhone: from,
        serviceType: "AIRTIME" || conversation.serviceType,
        network: conversation.wifiLocation,
        recipientNumber: from,
        amount: selectedPlan?.price,
        paymentReference: paymentRef,
        status: "PENDING",
      });

      conversation.paymentReference = paymentRef;
      await conversation.save();
      // Initiate payment
      const { status, paymentUrl, transactionReference } =
        await initiatePayment({
          paymentReference: paymentRef,
          email: BOT_EMAIL,
          description: `${conversation.serviceType} voucher purchase`,
          amount: selectedPlan.price,
          phoneNumber: from,
        });
      if (!status) {
        conversation.currentStep = "START";
        await conversation.save();
        await sendWhatsAppMessage(
          from,
          "❌ Error initiating payment. Please try again later."
        );
        return;
      }
      conversation.paymentGatewayReference = transactionReference;
      conversation.save();
      // get account details
      const {
        status: accountStatus,
        accountNumber,
        accountName,
        bankName,
        ussdCode,
      } = await getPaymentAccountDetails(transactionReference);
      if (!accountStatus) {
        conversation.currentStep = "START";
        await conversation.save();
        await sendWhatsAppMessage(
          from,
          "❌ Error retrieving payment details. Please try again later."
        );
        return;
      }

      // Send payment details to user or payment url
      const paymentMessage =
        `📋 *ORDER SUMMARY*\n\n` +
        `Service: ${conversation.serviceType}\n` +
        `Number: ${from}\n` +
        `Plan: ${selectedPlan.plan}\n` +
        `Amount: ₦${selectedPlan.price.toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💳 *PAYMENT DETAILS*\n\n` +
        `Bank: ${bankName}\n` +
        `Account Number: ${accountNumber}\n` +
        `Account Name: ${accountName}\n\n` +
        `Reference: ${paymentRef}\n\n` +
        `Transaction Ref: ${transactionReference}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ *IMPORTANT:*\n` +
        `Make payment of ₦${selectedPlan.price.toLocaleString()} to the account details above.\n\n` +
        `After payment, reply with "PAID" to confirm.\n\n` +
        `This order expires in 30 minutes ⏰.\n\n You can also click the link below to pay online:\n` +
        `${paymentUrl}`;

      await sendWhatsAppMessage(from, paymentMessage);
    } else {
      try {
        const plan = await Plan.findById(userInput);

        if (!plan) {
          await sendWhatsAppMessage(
            from,
            "Invalid plan selection. Please select from the list."
          );
          return;
        }

        conversation.selectedPlan = plan._id;
        conversation.amount = plan.price;
        await conversation.save();

        const paymentRef = `TXN${Date.now()}${Math.floor(
          Math.random() * 1000
        )}`;

        await Transaction.create({
          userPhone: from,
          serviceType: conversation.serviceType,
          network: conversation.network,
          recipientNumber: conversation.recipientNumber,
          plan: plan._id,
          amount: plan.price,
          paymentReference: paymentRef,
          status: "PENDING",
        });

        conversation.paymentReference = paymentRef;
        conversation.currentStep = "PAYMENT";
        await conversation.save();
        // Initiate payment
        const { status, paymentUrl, transactionReference } =
          await initiatePayment({
            paymentReference: paymentRef,
            email: BOT_EMAIL,
            description: `${conversation.serviceType} purchase`,
            amount: plan.price,
            phoneNumber: from,
          });
        if (!status) {
          conversation.currentStep = "START";
          await conversation.save();
          await sendWhatsAppMessage(
            from,
            "❌ Error initiating payment. Please try again later."
          );
          return;
        }
        conversation.paymentGatewayReference = transactionReference;
        conversation.save();
        // get account details
        const {
          status: accountStatus,
          accountNumber,
          accountName,
          bankName,
          ussdCode,
        } = await getPaymentAccountDetails(transactionReference);
        if (!accountStatus) {
          conversation.currentStep = "START";
          await conversation.save();
          await sendWhatsAppMessage(
            from,
            "❌ Error retrieving payment details. Please try again later."
          );
          return;
        }

        // Send payment details to user or payment url
        const paymentMessage =
          `📋 *ORDER SUMMARY*\n\n` +
          `Service: ${conversation.serviceType}\n` +
          `Network: ${conversation.network}\n` +
          `Number: ${conversation.recipientNumber}\n` +
          `Plan: ${plan.name}\n` +
          `Amount: ₦${plan.price.toLocaleString()}\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `💳 *PAYMENT DETAILS*\n\n` +
          `Bank: ${bankName}\n` +
          `Account Number: ${accountNumber}\n` +
          `Account Name: ${accountName}\n\n` +
          `Reference: ${paymentRef}\n\n` +
          `Transaction Ref: ${transactionReference}\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `⚠️ *IMPORTANT:*\n` +
          `Make payment of ₦${plan.price.toLocaleString()} to the account details above.\n\n` +
          `After payment, reply with "PAID" to confirm.\n\n` +
          `This order expires in 30 minutes ⏰.\n\n You can also click the link below to pay online:\n` +
          `${paymentUrl}`;

        await sendWhatsAppMessage(from, paymentMessage);
      } catch (error) {
        console.error("❌ Error in plan selection:", error);
        await sendWhatsAppMessage(
          from,
          "Error processing your selection. Please try again."
        );
      }
    }
  }

  async handlePaymentConfirmation(from, conversation, userInput, senderName) {
    const input = userInput.toUpperCase();

    if (input === "PAID" || input === "DONE" || input === "CONFIRMED") {
      const transaction = await Transaction.findOne({
        paymentReference: conversation.paymentReference,
      });
      if (!transaction) {
        await sendWhatsAppMessage(
          from,
          "Transaction not found. Please contact support."
        );
        return;
      }
      // get transaction status from payment gateway
      const { status, paymentStatus } = await getPaymentStatus(
        conversation.paymentGatewayReference
      );
      // console.log({ paymentStatus, status });
      if (!status) {
        await sendWhatsAppMessage(
          from,
          "❌ Error checking payment status. Please try again later."
        );
        return;
      }
      if (paymentStatus !== "PAID") {
        await sendWhatsAppMessage(
          from,
          "Payment not confirmed yet. Please ensure you have completed the payment and try again."
        );
        return;
      }
      if (paymentStatus === "PAID") {
        transaction.status = "PAID";
        transaction.paymentConfirmedAt = new Date();
        await transaction.save();

        await sendWhatsAppMessage(
          from,
          `✅ Payment confirmation received!\n\n` +
            `Reference: ${conversation.paymentReference}\n\n` +
            `Your order is being processed. You will receive a confirmation message shortly.\n\n` +
            `Thank you for using our service! 🎉`
        );

        transaction.status = "PROCESSING";
        await transaction.save();
        // make the actual service delivery here (omitted for brevity)
        let planId = await Plan.findById(conversation.selectedPlan);
        const { status, msg } = await handlePurchase({
          serviceType: conversation.serviceType,
          network: conversation?.network,
          amount: conversation.amount,
          planId:
            conversation.serviceType == "WIFI"
              ? conversation.selectedWifiPlan
              : planId?.providerCode,
          phoneNumber: conversation.recipientNumber,
          wifiLocation: conversation.wifiLocation,
          from,
        });

        if (!status) {
          await sendWhatsAppMessage(
            from,
            `Congratulation 🫵 ${senderName}\n` + msg ||
              "❌ Error processing your order. Please contact support."
          );
          return;
        } else {
          conversation.currentStep = "COMPLETED";
          await conversation.save();

          transaction.status = "COMPLETED";
          transaction.completedAt = new Date();
          await transaction.save();

          await this.updateUserStats(
            from,
            conversation.amount,
            conversation.serviceType,
            conversation.network
          );

          await sendWhatsAppMessage(
            from,
            `🎉 *Transaction Successful!*\n\n` +
              `Your ${conversation.serviceType.toLowerCase()} has been delivered to ${
                conversation.recipientNumber
              }\n\n` +
              `Response: ${msg}\n\n` +
              `Reference: ${conversation.paymentReference}\n\n` +
              `Type "start" to make another purchase.`
          );
          await Conversation.deleteOne({ phoneNumber: from });
        }
      } else {
        await sendWhatsAppMessage(
          from,
          "Transaction not found. Please contact support."
        );
      }
    } else if (input === "CANCEL") {
      await Transaction.updateOne(
        { paymentReference: conversation.paymentReference },
        { status: "CANCELLED" }
      );
      await Conversation.deleteOne({ phoneNumber: from });
      await sendWhatsAppMessage(
        from,
        'Order cancelled. Type "start" to begin a new order.'
      );
    } else {
      await sendWhatsAppMessage(
        from,
        `Waiting for payment confirmation...\n\n` +
          `Reply "PAID" after making payment\n` +
          `Reply "CANCEL" to cancel this order`
      );
    }
  }
}

module.exports = new ConversationController();
