const axios = require("axios");
const PaymentMetadata = require("./models/paymentMetadata");
const Money = require("./models/money");
const BankDetails = require("./models/bankDetails");
const walletFlow = require("./models/walletFlow");
const User = require("./models/user");

const checkPaymentStatus = async (merchantReferenceId, userId) => {
  try {
    console.log(userId);
    const moneyRecord = await Money.findOne({
      transactionId: merchantReferenceId,
    });

    if (moneyRecord?.paymentProces === false) {
      await Money.findOne(
        {
          transactionId: merchantReferenceId,
        },
        {
          paymentProces: true,
        }
      );
      counter = moneyRecord?.counter;
      const requestPayload = {
        mid: "GROWONSMED",
        merchantReferenceId,
      };

      const currentDate = new Date();
      const paymentMetadata = await PaymentMetadata.findOne({
        expiry: { $gt: currentDate },
      }).sort({ createdAt: 1 });

      const token = paymentMetadata?.authToken || "";

      const response = await axios.post(
        "https://server.paygic.in/api/v2/checkPaymentStatus",
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
            token,
          },
        }
      );

      const { status, statusCode, txnStatus, msg, data } = response.data;

      console.log(txnStatus);

      if (statusCode !== 200) {
        if (statusCode === 300) {
          return { error: "Transaction not found. Please check the details." };
        }
        console.log(status);
        return { error: msg || "Failed to check payment status." };
      }

      if (txnStatus === "SUCCESS") {
        const bankDetails = await BankDetails.findOne().sort({ createdAt: -1 });

        if (!bankDetails) {
          await updateRecordFailure(merchantReferenceId);
          return {
            error: "Bank details not found for processing the transaction.",
          };
        }

        const addMoneyResult = await AddMoney(
          merchantReferenceId,
          userId,
          data?.amount.toString(),
          merchantReferenceId
        );

        if (addMoneyResult.error) {
          await updateRecordFailure(merchantReferenceId);
          return { error: addMoneyResult.error };
        }
        return { success: "Transaction successful and money added!" };
      } else if (txnStatus === "REJECT") {
        if (counter >= 1) {
          await updateRecordFailure(merchantReferenceId);
          return { error: "Transaction rejected. Please try again." };
        } else {
          counter = counter + 1;
          await updateRecordPending(merchantReferenceId, counter);
          return { error: "Transaction is pending." };
        }
      } else {
        if (counter >= 1) {
          await updateRecordFailure(merchantReferenceId);
          return { error: "Transaction is Failed. Please Try again." };
        } else {
          counter = counter + 1;
          await updateRecordPending(merchantReferenceId, counter);
          return { error: "Transaction is pending." };
        }
      }
    } else {
      await Money.findOneAndUpdate(
        { transactionId: merchantReferenceId },
        {
          counter: moneyRecord?.counter + 1,
        }
      );
      return { error: "Transaction is already under process." };
    }
  } catch (error) {
    console.error("Error during payment status check:", error.message);
    return { error: "An error occurred while checking payment status." };
  }
};

const updateRecordPending = async (merchantReferenceId, counter) => {
  await Money.findOneAndUpdate(
    { transactionId: merchantReferenceId },
    {
      paymentProces: false,
      status: "PENDING",
      counter: counter,
    }
  );
};

const updateRecordFailure = async (merchantReferenceId) => {
  await walletFlow.findOneAndUpdate(
    { moneyId: merchantReferenceId },
    { status: "FAILED" }
  );

  await Money.findOneAndUpdate(
    { transactionId: merchantReferenceId },
    {
      paymentProces: true,
      status: "FAILED",
    }
  );
};

const updateRecordSucess = async (merchantReferenceId) => {
  await walletFlow.findOneAndUpdate(
    { moneyId: merchantReferenceId },
    { status: "SUCCESS" }
  );

  await Money.findOneAndUpdate(
    { transactionId: merchantReferenceId },
    {
      paymentProces: true,
      status: "SUCCESS",
    }
  );
};

const AddMoney = async (transactionId, userId, amount, merchantReferenceId) => {
  if (!userId || !transactionId || !amount) {
    return { error: "Invalid data provided." };
  }

  try {
    const updatedMoney = Number(amount);

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return { error: "User not found." };
    }

    const totalMoney = Number(user.totalMoney);

    await User.findByIdAndUpdate(userId, {
      totalMoney: totalMoney + updatedMoney,
    });

    await updateRecordSucess(merchantReferenceId);

    return { success: "Money added successfully!" };
  } catch (error) {
    console.error("Error adding money:", error.message);
    return { error: "An error occurred. Please try again later." };
  }
};

module.exports = { checkPaymentStatus, AddMoney };
