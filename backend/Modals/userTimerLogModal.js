// models/TimerLog.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const TimerLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // Storing date as a string in 'YYYY-MM-DD' format
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
  },
  source: {
    type: String,
    required: true,
  },
  timeType: {
    type: String,
    required: true,
  },
  logs: [
    {
      startTime: {
        type: String,
        required: true,
      },
      stopTime: {
        type: String,
        required: false,
      },
      reason: {
        type: String,
        required: false,
      },
    },
  ],
});

const TimerLog = mongoose.model("TimerLog", TimerLogSchema);

module.exports = TimerLog;
