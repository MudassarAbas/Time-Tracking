const mongoose = require("mongoose");

const projectUsers = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  role: {
    type: String,
  },
  addedViaTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
});

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    min: 1,
    max: 255,
  },
  projectUsers: {
    type: [projectUsers],
  },
  projectTeams: {
    type: [String],
  },
  projectStatus: {
    type: String,
  },
  projectStartDate: {
    type: String,
    date: new Date(),
  },
});

module.exports = mongoose.model("Project", projectSchema);
