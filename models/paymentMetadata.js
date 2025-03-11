const mongoose = require('mongoose');

const paymentMetaDataSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => require('uuid').v4(),
      alias: '_id',
    },
    authToken: {
      type: String,
      required: true,
    },
    usersTypeTag: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    expiry: {
      type: Date,
      required: true,
    },
  },
  { collection: "PaymentMetaData"  }
);

module.exports = mongoose.model('PaymentMetaData', paymentMetaDataSchema);

