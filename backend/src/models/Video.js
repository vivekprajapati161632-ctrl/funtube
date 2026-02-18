const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000
    },
    thumbnailUrl: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      default: []
    },
    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

videoSchema.index({ createdAt: -1 });
videoSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Video", videoSchema);
