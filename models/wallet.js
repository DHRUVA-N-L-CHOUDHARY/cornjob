const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.UUID(),
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    currencyCode: {
      type: String,
      required: true,
    },
    walletTypeId: {
      type: String,
      required: true,
      ref: 'WalletType',
    },
    walletName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "Wallet"
  }
);

module.exports = mongoose.model('Wallet', walletSchema);
