const Settings = require("./models/settings");
const Order = require("./models/order");
const Wallet = require("./models/walletFlow");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/product");
const getLeads = require("./getLeads"); // Import the getLeads function
const cloudinary = require("cloudinary").v2; // Import Cloudinary
const config = require("./config");
const { checkPaymentStatus } = require("./processPendingPayment");
const Money = require("./models/money");
const processOrders = require("./processPendingOrders");

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY.CLOUD_NAME,
  api_key: config.CLOUDINARY.API_KEY,
  api_secret: config.CLOUDINARY.API_SECRET,
});

exports.scheduledTask = async (req, res) => {
  console.log("Cron job executed at:", new Date());

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 10000,
      });
      console.log("Connected to MongoDB");
    }

    const pendingInvoices = await Money.find({
      status: "PENDING",
      paymentType: "PAYMENT_GATEWAY",
    });

    for (const invoice of pendingInvoices) {

      const merchantReferenceId = invoice.transactionId;
      const userId = invoice.userId;
      const walletId = invoice.walletId;

      if (!merchantReferenceId) {
        console.warn("Missing transactionId in a pending order, skipping...");
        continue;
      }

      console.log(`Processing transaction: ${merchantReferenceId}`);

      const result = await checkPaymentStatus(merchantReferenceId, userId, walletId);

      console.log(result);

      if (result.error) {
        console.error(
          `Failed to process transaction ${merchantReferenceId}: ${result.error}`
        );
      } else {
        console.log(
          `Transaction ${merchantReferenceId} processed successfully: ${result.success}`
        );
      }
    }

    await processOrders();

    console.log("Cron job completed for processing orders");
    res.status(200).send("Task executed successfully!");

  } catch (error) {
    console.error("Error in cron job:", error);
    res.status(500).send("Error executing task.");
  }
};
