const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    promoterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reelUrl: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["instagram", "youtube", "tiktok", "other"],
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    earnings: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

submissionSchema.index({ campaignId: 1, promoterId: 1, reelUrl: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
