const mongoose = require("mongoose");

const payoutAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ["bank_account", "vpa"],
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    upiId: {
      type: String,
      lowercase: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("PayoutAccount", payoutAccountSchema);
