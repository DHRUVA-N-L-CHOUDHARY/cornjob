const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const Product = require("./models/product");
const fs = require("fs");
const { parse } = require("json2csv");
const config = require("./config");

async function getLeads(productName, productId, numOfLines) {
  try {
    // Step 1: Fetch product details
    const product = await Product.findUnique({ id : productId });
    
    if (!product) {
      throw new Error(`Invalid product: product "${productName}" not found`);
    }

    if (!product.sheetLink || !product.sheetName) {
      throw new Error(`Product "${productName}" is missing sheet link or sheet name`);
    }

    // Step 2: Authenticate with Google Sheets API
    const sheetLink = product.sheetLink;
    const sheetName = product.sheetName;

    // Extract spreadsheetId from sheetLink
    const spreadsheetId = sheetLink.match(
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/ 
    )[1];

    const scopes = [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ];

    const auth = new GoogleAuth({
      keyFile: config.GOOGLE_CREDENTIALS_PATH,
      scopes,
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Step 3: Fetch spreadsheet information and validate sheet
    const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheetInfo.data.sheets.find(
      (sheet) => sheet.properties.title === sheetName
    );

    if (!sheet) {
      throw new Error(`Sheet with name "${sheetName}" not found in spreadsheet "${spreadsheetId}"`);
    }

    const sheetId = sheet.properties.sheetId;

    // Step 4: Fetch rows from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      throw new Error("No data found in the sheet or insufficient rows");
    }

    const newStock = rows.length - 1; 
    console.log(`Initial stock for product "${productName}": ${newStock}`);

    if (numOfLines <= 0 || numOfLines > newStock) {
      throw new Error(`Requested number of leads is invalid or exceeds available stock for product "${productName}"`);
    }

    const headers = rows[0]; // The first row contains headers
    const requiredLeads = rows.slice(1, numOfLines + 1); // Fetch the required number of leads

    const data = requiredLeads.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || ""; // Handle missing values
      });
      return obj;
    });

    const csv = parse(data);
    const fileName = `./leads_${productName}_${Date.now()}.csv`;

    fs.writeFileSync(fileName, csv);
    console.log(`CSV file created for product "${productName}": ${fileName}`);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: 1, // Start after the header row
                endIndex: numOfLines + 1, // End after fetching the required leads
              },
            },
          },
        ],
      },
    });

    console.log(`Removed ${numOfLines} rows from the sheet for product "${productName}"`);

    // Step 8: Update product stock based on the remaining rows
    const updatedRows = response.data.values.length - numOfLines - 1; // Subtract rows removed and header
    console.log(`Updated stock for product "${productName}": ${updatedRows}`);

    await Product.updateOne(
      { productName },
      { stock: updatedRows }
    );
    console.log(`Stock updated for product "${productName}" to ${updatedRows}`);

    return fileName; // Return the generated CSV file path
  } catch (error) {
    console.error(`Error in getLeads function for product "${productName}":`, error.message);
    throw error; // Rethrow error after logging it
  }
}

module.exports = getLeads;
