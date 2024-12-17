const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User who took the screenshot
    required: true,
  },
  s3Url: {
    type: String, // URL to the screenshot in the AWS S3 bucket
    required: true,
  },
  captureTime: {
    type: Date, // Timestamp when the screenshot was captured
    required: true,
  },
  createdAt: {
    type: Date, // When the screenshot record was created
    default: Date.now,
  },
});

const Screenshot = mongoose.model("Screenshot", screenshotSchema);

module.exports = Screenshot;
