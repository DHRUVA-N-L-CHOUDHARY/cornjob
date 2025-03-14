const Settings = require("./models/settings");
const Order = require("./models/order");
const walletFlow = require("./models/walletFlow");
const productOrdered = require("./models/productOrdered");
const getLeads = require("./getLeads");
const cloudinary = require("cloudinary").v2;
const config = require("./config");

cloudinary.config({
  cloud_name: config.CLOUDINARY.CLOUD_NAME,
  api_key: config.CLOUDINARY.API_KEY,
  api_secret: config.CLOUDINARY.API_SECRET,
});

const processOrders = async (req, res) => {
  try {
    const settingsList = await Settings.find();

    if (!settingsList || settingsList.length === 0) {
      console.log("No settings records found.");
      return res.status(200).send("No settings records found.");
    }

    for (const settings of settingsList) {
      const { domainId, autmVar } = settings;

      if (!autmVar) {
        console.log(
          `Skipping processing for domain ${domainId} as autmVar is false.`
        );
        continue;
      }

      console.log(`Processing orders for domain ${domainId}...`);

      const pendingOrders = await Order.find({ status: "PENDING", domainId });

      console.log("Orders with populated products:", pendingOrders);

      for (const order of pendingOrders) {
        if (!order) continue;
        const { _id, orderId, files } = order;
        let allProductsProcessed = true;
        const uploadedFiles = [];

        const orderProducts = await productOrdered.find({ orderId : _id });

        if (!files) order.files = new Array(orderProducts.length).fill(null);
        console.log(`Processing order ${orderId} for domain ${domainId}...`);

        for (let index = 0; index < orderProducts.length; index++) {
          const productOrderedDetail = orderProducts[index];
          
          if (!productOrderedDetail) {
            console.log(
              `Product ${productOrderedDetail.name} not found. Skipping.`
            );
            allProductsProcessed = false;
            continue;
          }

          try {
            if (order.files[index]) {
              console.log(
                `Skipping extraction for ${productOrderedDetail.name}, file already exists.`
              );
              uploadedFiles.push(order.files[index]);
              continue;
            }

            const fileName = `${productOrderedDetail.name.replace(/\s+/g, "_")}.csv`;

            const csvFilePath = await getLeads(productOrderedDetail.name, productOrderedDetail.productId, productOrderedDetail.quantity);
            console.log(
              `CSV file generated for product ${productOrderedDetail.name}: ${csvFilePath}`
            );

            const result = await cloudinary.uploader.upload(csvFilePath, {
              resource_type: "raw",
              folder: "GrowonsMedia",
              use_filename: true,
              unique_filename: false,
            });

            console.log(`File uploaded to Cloudinary: ${result.secure_url}`);

            uploadedFiles.push({
              public_id: result.public_id,
              secure_url: result.secure_url,
              fileName: fileName,
              fileType: "text/csv",
            });

            order.files[index] = {
              public_id: result.public_id,
              secure_url: result.secure_url,
              fileName: fileName,
              fileType: "text/csv",
            };
          } catch (error) {
            console.error(
              `Error processing leads for product ${productOrderedDetail.name}:`,
              error.message
            );
            allProductsProcessed = false;
            break;
          }
        }

        if (allProductsProcessed) {
          console.log(`Updating order ${orderId} to SUCCESS`);
          await Order.updateOne(
            { orderId },
            { status: "SUCCESS", files: uploadedFiles }
          );


          const wallet = await walletFlow.findOne({ moneyId: orderId });
          if (wallet) {
            await walletFlow.updateOne({
              moneyId : orderId
            }, { status: "SUCCESS" });
            console.log(
              `Wallet status updated to SUCCESS for moneyId: ${orderId}`
            );
          } else {
            console.log(`No wallet record found for moneyId: ${orderId}`);
          }
        } else {
          console.log(`Some products failed in order ${orderId}`);
          await Order.updateOne(
            { orderId },
            { status: "PENDING", files: uploadedFiles }
          );
        }
      }
    }

    console.log("Cron job completed for processing orders");
  } catch (error) {
    console.error("Error in processing orders:", error);
  }
};

module.exports = processOrders;
