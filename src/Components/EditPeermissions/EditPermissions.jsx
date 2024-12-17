import React, { useState, useEffect } from "react";
import checkboxEmpty from "../Assets/checkbox-empty.png"; // Your checkbox empty image
import checkboxChecked from "../Assets/checkbox-checked.png"; // Your checkbox checked image
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";

function EditPermissions({
  show,
  onClose,
  initialPermissions,
  initialSubPermissions,
  teamId,
}) {
  const accessToken = useSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [subPermissions, setSubPermissions] = useState(initialSubPermissions);

  useEffect(() => {
    setPermissions(initialPermissions);
    setSubPermissions(initialSubPermissions);
  }, [initialPermissions, initialSubPermissions]);

  const handlePermissionChange = (permission) => {
    setPermissions((prevPermissions) => {
      const newState = !prevPermissions[permission];

      const updatedPermissions = {
        ...prevPermissions,
        [permission]: newState,
      };

      setSubPermissions((prevSubPermissions) => {
        const updatedSubPermissions = { ...prevSubPermissions };

        if (!newState) {
          const subPermissionKey = `${permission}TeamLeads`;
          updatedSubPermissions[subPermissionKey] = false;
        }

        return updatedSubPermissions;
      });

      return updatedPermissions;
    });
  };

  const handleSubPermissionChange = (subPermission) => {
    setSubPermissions((prevSubPermissions) => ({
      ...prevSubPermissions,
      [subPermission]: !prevSubPermissions[subPermission],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/team/update-permissions/${teamId}`,
        {
          permissions,
          subPermissions,
        },
        {
          headers: {
            token: accessToken,
          },
        }
      );

      toast.success("Permissions updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>
          <label className="permissions-text">Team Lead Permissions</label>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="permissions-section">
            <div className="margin-top-5">
              <div
                className="permission-item"
                onClick={() => handlePermissionChange("approveTimesheets")}
              >
                <img
                  src={
                    permissions.approveTimesheets
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Approve timesheets</label>
              </div>
              <div
                className="permission-sub-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubPermissionChange("approveTimesheetsTeamLeads");
                }}
                style={{
                  opacity: permissions.approveTimesheets ? 1 : 0.7,
                  pointerEvents: permissions.approveTimesheets
                    ? "auto"
                    : "none",
                }}
              >
                <img
                  src={
                    subPermissions.approveTimesheetsTeamLeads
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Only send notifications to team leads</label>
              </div>

              <div
                className="permission-item"
                onClick={() => handlePermissionChange("approveRequests")}
              >
                <img
                  src={
                    permissions.approveRequests
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Approve off requests</label>
              </div>
              <div
                className="permission-sub-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubPermissionChange("approveRequestsTeamLeads");
                }}
                style={{
                  opacity: permissions.approveRequests ? 1 : 0.7,
                  pointerEvents: permissions.approveRequests ? "auto" : "none",
                }}
              >
                <img
                  src={
                    subPermissions.approveRequestsTeamLeads
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Only send notifications to team leads</label>
              </div>

              <div
                className="permission-item"
                onClick={() => handlePermissionChange("scheduleShifts")}
              >
                <img
                  src={
                    permissions.scheduleShifts ? checkboxChecked : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Schedule shifts</label>
              </div>
              <div
                className="permission-sub-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubPermissionChange("scheduleShiftsTeamLeads");
                }}
                style={{
                  opacity: permissions.scheduleShifts ? 1 : 0.7,
                  pointerEvents: permissions.scheduleShifts ? "auto" : "none",
                }}
              >
                <img
                  src={
                    subPermissions.scheduleShiftsTeamLeads
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Only send notifications to team leads</label>
              </div>

              <div
                className="permission-item"
                onClick={() =>
                  handlePermissionChange("weeklyLimitNotification")
                }
              >
                <img
                  src={
                    permissions.weeklyLimitNotification
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Weekly time limit notification</label>
              </div>
              <div
                className="permission-sub-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubPermissionChange("weeklyLimitNotificationTeamLeads");
                }}
                style={{
                  opacity: permissions.weeklyLimitNotification ? 1 : 0.7,
                  pointerEvents: permissions.weeklyLimitNotification
                    ? "auto"
                    : "none",
                }}
              >
                <img
                  src={
                    subPermissions.weeklyLimitNotificationTeamLeads
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Only send notifications to team leads</label>
              </div>

              <div
                className="permission-item"
                onClick={() => handlePermissionChange("workBreakNotifications")}
              >
                <img
                  src={
                    permissions.workBreakNotifications
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Receive work break issue notifications</label>
              </div>
              <div
                className="permission-sub-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubPermissionChange("workBreakNotificationsTeamLeads");
                }}
                style={{
                  opacity: permissions.workBreakNotifications ? 1 : 0.7,
                  pointerEvents: permissions.workBreakNotifications
                    ? "auto"
                    : "none",
                }}
              >
                <img
                  src={
                    subPermissions.workBreakNotificationsTeamLeads
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Only send notifications to team leads</label>
              </div>

              <div
                className="permission-item"
                onClick={() => handlePermissionChange("editRoles")}
              >
                <img
                  src={permissions.editRoles ? checkboxChecked : checkboxEmpty}
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Edit team members and projects roles</label>
              </div>
              <div
                className="permission-sub-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubPermissionChange("editRolesTeamLeads");
                }}
                style={{
                  opacity: permissions.editRoles ? 1 : 0.7,
                  pointerEvents: permissions.editRoles ? "auto" : "none",
                }}
              >
                <img
                  src={
                    subPermissions.editRolesTeamLeads
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Only send notifications to team leads</label>
              </div>

              <div
                className="permission-item"
                onClick={() => handlePermissionChange("viewScreenshots")}
              >
                <img
                  src={
                    permissions.viewScreenshots
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>View screenshots/activities for other members</label>
              </div>

              <div
                className="permission-item"
                onClick={() => handlePermissionChange("createEditProjects")}
              >
                <img
                  src={
                    permissions.createEditProjects
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Create and edit team’s projects</label>
              </div>

              <div
                className="permission-item"
                onClick={() => handlePermissionChange("manageFinancials")}
              >
                <img
                  src={
                    permissions.manageFinancials
                      ? checkboxChecked
                      : checkboxEmpty
                  }
                  alt="checkbox"
                  className="custom-checkbox"
                />
                <label>Manage financials</label>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPermissions;
