const Settings = require("./models/settings");
const Order = require("./models/order");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/product");
const getLeads = require("./getLeads"); // Import the getLeads function
const cloudinary = require("cloudinary").v2; // Import Cloudinary
const config = require("./config");


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
      });
      console.log("Connected to MongoDB");
    }

    // Step 1: Check the value of automaticVariable from Settings
    const settings = await Settings.findOne();
    if (!settings || !settings.automaticVariable) {
      console.log("Cron job skipped as automaticVariable is false or not set.");
      return res.status(200).send("Task skipped as automaticVariable is false.");
    }

    console.log("Processing pending orders...");

    // Step 2: Fetch all pending orders
    const pendingOrders = await Order.find({ status: "PENDING" });

    // Process orders one by one
    for (const order of pendingOrders) {
      const { products, orderId, files } = order;
      let allProductsProcessed = true;
      const uploadedFiles = [];

      if (!files) {
        order.files = new Array(products.length).fill(null); // Initialize with empty objects for each product
      }

      console.log(`Processing order ${orderId}...`);

      // Process each product one by one within the order
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        const { name, quantity } = product;

        try {
          // If the file already exists, skip extraction and uploading
          if (order.files[index]) {
            console.log(`Skipping extraction for ${name}, file already exists.`);
            uploadedFiles.push(order.files[index]);
            continue;  // Skip to the next product
          }

          const fileName = `${name.replace(/\s+/g, '_')}_${quantity}.csv`;

          const csvFilePath = await getLeads(name, quantity);
          console.log(`CSV file generated for product ${name}: ${csvFilePath}`);

          // Upload the CSV to Cloudinary
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

          // Once the file is uploaded, store the metadata in the files array
          order.files[index] = {
            public_id: result.public_id,
            secure_url: result.secure_url,
            fileName: fileName,
            fileType: "text/csv",
          };
        } catch (error) {
          console.error(`Error processing leads for product ${name}:`, error.message);
          allProductsProcessed = false;
          break;  // Break out of the product loop if an error occurs
        }
      }

      // If all products were processed successfully, update the order
      if (allProductsProcessed) {
        console.log(`Updating order ${orderId} to SUCCESS`);
        await Order.updateOne(
          { orderId },
          { status: "SUCCESS", files: uploadedFiles }
        );
      } else {
        console.log(`Some products failed in order ${orderId}`);
        await Order.updateOne(
          { orderId },
          { status: "PENDING", files: uploadedFiles }
        );
      }
    }

    console.log("Cron job completed for processing orders");
    res.status(200).send("Task executed successfully!");
  } catch (error) {
    console.error("Error in cron job:", error);
    res.status(500).send("Error executing task.");
  }
};
