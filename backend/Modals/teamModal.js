const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  approveTimesheets: { type: Boolean, default: false },
  approveRequests: { type: Boolean, default: false },
  scheduleShifts: { type: Boolean, default: false },
  weeklyLimitNotification: { type: Boolean, default: false },
  workBreakNotifications: { type: Boolean, default: false },
  editRoles: { type: Boolean, default: false },
  viewScreenshots: { type: Boolean, default: false },
  createEditProjects: { type: Boolean, default: false },
  manageFinancials: { type: Boolean, default: false },
});

const subPermissionSchema = new mongoose.Schema({
  approveTimesheetsTeamLeads: { type: Boolean, default: false },
  approveRequestsTeamLeads: { type: Boolean, default: false },
  scheduleShiftsTeamLeads: { type: Boolean, default: false },
  weeklyLimitNotificationTeamLeads: { type: Boolean, default: false },
  workBreakNotificationsTeamLeads: { type: Boolean, default: false },
  editRolesTeamLeads: { type: Boolean, default: false },
});

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    min: 1,
    max: 255,
  },
  teamUsers: [
    {
      userId: String,
      isTeamLead: Boolean,
      teamRole: String, // Add other role-related information if needed
    },
  ],
  teamProjects: {
    type: [String],
  },
  permissions: {
    type: permissionSchema,
  },
  subPermissions: {
    type: subPermissionSchema,
  },
  teamStatus: {
    type: String,
  },
  teamStartDate: {
    type: String,
  },
});

module.exports = mongoose.model("Team", teamSchema);
