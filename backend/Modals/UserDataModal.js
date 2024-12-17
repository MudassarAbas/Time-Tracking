const mongoose = require("mongoose");

const UserDataScheme = new mongoose.Schema(
  {
    user: {
      type: String,
    },
    screenshot: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserData", UserDataScheme);
