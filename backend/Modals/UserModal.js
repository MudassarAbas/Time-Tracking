const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  teamRole: {
    type: String,
  },
  isTeamLead: {
    type: Boolean,
    default: false,
  },
});

const projectSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  projectRole: String, // Add other role-related information if needed
});

const UserScheme = new mongoose.Schema({
  firstName: {
    type: String,
    min: 1,
    max: 255,
  },
  lastName: {
    type: String,
    max: 255,
    min: 1,
  },
  email: {
    type: String,
    min: 3,
    max: 255,
    unique: true, // Ensure email uniqueness
  },
  password: {
    type: String,
    max: 1024,
    min: 8,
  },
  employeeStatus: {
    type: String,
  },
  role: {
    type: String,
  },
  timeTrackingStatus: {
    type: Boolean,
  },
  invitationStatus: {
    type: String,
  },
  teams: {
    type: [teamSchema],
  },
  projects: {
    type: [projectSchema],
  },
  lastTrackTime: {
    type: Date,
  },
  timeZone: {
    type: String,
  },
  allowedApps: {
    type: String,
  },
  idleTimeOut: {
    type: String,
  },
  keepIdleTime: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  registrationToken: {
    type: String,
  },
  registrationTokenExpiry: {
    type: Date,
  },
  dateAdded: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("User", UserScheme);
