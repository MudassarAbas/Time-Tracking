import React, { useState, useRef, useEffect } from "react";
import "./addTeamModal.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import chevDown from "../Assets/chevron-down.png";
import chevUp from "../Assets/chevron-up.png";
import crossIcon from "../Assets/close-cross.png";
import checkboxEmpty from "../Assets/checkbox-empty.png"; // Your checkbox empty image
import checkboxChecked from "../Assets/checkbox-checked.png"; // Your checkbox checked image
import { useSelector } from "react-redux";

const AddTeamModal = ({ show, onClose, onUpdate }) => {
  const [teamName, setTeamName] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allTeamLeads, setAllTeamLeads] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [teamProjects, setTeamProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [teamLeadSearch, setTeamLeadSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [teamLeadDropdownOpen, setTeamLeadDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    approveTimesheets: false,
    approveRequests: false,
    scheduleShifts: false,
    weeklyLimitNotification: false,
    workBreakNotifications: false,
    editRoles: false,
    viewScreenshots: false,
    createEditProjects: false,
    manageFinancials: false,
  });

  const [subPermissions, setSubPermissions] = useState({
    approveTimesheetsTeamLeads: false,
    approveRequestsTeamLeads: false,
    scheduleShiftsTeamLeads: false,
    weeklyLimitNotificationTeamLeads: false,
    workBreakNotificationsTeamLeads: false,
    editRolesTeamLeads: false,
  });

  const handlePermissionChange = (permission) => {
    setPermissions((prevPermissions) => {
      const newState = !prevPermissions[permission];

      // Update the permission state
      const updatedPermissions = {
        ...prevPermissions,
        [permission]: newState,
      };

      // Update sub-permission state
      setSubPermissions((prevSubPermissions) => {
        const updatedSubPermissions = { ...prevSubPermissions };

        // If the main permission is unchecked, uncheck the related sub-permission
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

  const accessToken = useSelector((state) => state.auth.token);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/project/get-all",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setAllProjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/all-users",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setAllTeamLeads(response.data);
      setAllMembers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  const memberDropdownRef = useRef(null);
  const teamLeadDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      teamMembers.length === 0 ||
      teamLeads.length === 0 ||
      teamProjects.length === 0
    ) {
      toast.error("Please add at least one member, one lead, and one project.");
      setLoading(false);
      return;
    }

    const teamUsers = [
      ...teamMembers.map((member) => ({
        userId: member._id,
        isTeamLead: false,
        teamRole: "user",
      })),
      ...teamLeads.map((lead) => ({
        userId: lead._id,
        isTeamLead: true,
        teamRole: "manager",
      })),
    ];

    const newTeam = {
      teamName,
      teamUsers,
      teamProjects: teamProjects.map((project) => project._id),

      permissions: permissions,
      subPermissions: subPermissions,

      teamStatus: "active",
      teamStartDate: new Date(),
    };

    const invitePromise = axios.post(
      "http://localhost:5000/api/team/create",
      newTeam,
      {
        headers: {
          token: accessToken,
        },
      }
    );

    toast.promise(invitePromise, {
      loading: "Creating team...",
      success: "Team created successfully!",
      error: "Failed to create team. Please try again.",
    });

    try {
      const response = await invitePromise;
      console.log(response.data);
      setTeamName("");
      setTeamMembers([]);
      setTeamLeads([]);
      setTeamProjects([]);
      onUpdate();
      onClose();
    } catch (err) {
      console.log("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item, setItems, items) => {
    if (!items.some((i) => i._id === item._id)) {
      setItems([...items, item]);
    }
  };

  const handleRemoveItem = (item, setItems, items) => {
    setItems(items.filter((i) => i._id !== item._id));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        memberDropdownOpen &&
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target)
      ) {
        setMemberDropdownOpen(false);
      }
      if (
        teamLeadDropdownOpen &&
        teamLeadDropdownRef.current &&
        !teamLeadDropdownRef.current.contains(event.target)
      ) {
        setTeamLeadDropdownOpen(false);
      }
      if (
        projectDropdownOpen &&
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setProjectDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [memberDropdownOpen, teamLeadDropdownOpen, projectDropdownOpen]);

  if (!show) {
    return null;
  }

  const filterOptions = (options, selectedItems, otherSelectedItems = []) =>
    options.filter(
      (option) =>
        !selectedItems.some((item) => item._id === option._id) &&
        !otherSelectedItems.some((item) => item._id === option._id)
    );

  const searchFilter = (item, search) =>
    item.firstName.toLowerCase().includes(search.toLowerCase()) ||
    item.lastName.toLowerCase().includes(search.toLowerCase()) ||
    `${item.firstName} ${item.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());

  return (
    <div className="modal-overlay">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Add Team</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Team Name<span className="red-star">*</span>
            </label>
            <input
              style={{ borderRadius: "10px", height: "47px" }}
              type="text"
              value={teamName}
              className="enter-team-name-input"
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
          <div className="form-group">
            <label>
              Add Members<span className="red-star">*</span>
            </label>
            <div className="project-select" ref={memberDropdownRef}>
              <div
                className={`selected-projects ${
                  memberDropdownOpen ? "open" : ""
                }`}
              >
                {teamMembers.map((member) => (
                  <span key={member._id} className="selected-project">
                    {member.firstName + " " + member.lastName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() =>
                        handleRemoveItem(member, setTeamMembers, teamMembers)
                      }
                      className="close-cross"
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onClick={() => setMemberDropdownOpen(true)}
                  placeholder="Enter work email"
                />
                {teamMembers.length === 0 && (
                  <img
                    src={memberDropdownOpen ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {memberDropdownOpen && (
                <div className="project-options">
                  {filterOptions(allMembers, teamMembers, teamLeads)
                    .filter((member) => searchFilter(member, memberSearch))
                    .map((member) => (
                      <div
                        key={member._id}
                        className="project-option"
                        onClick={() =>
                          handleAddItem(member, setTeamMembers, teamMembers)
                        }
                      >
                        {member.firstName + " " + member.lastName}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>
              Team Leads<span className="red-star">*</span>
            </label>
            <div className="project-select" ref={teamLeadDropdownRef}>
              <div
                className={`selected-projects ${
                  teamLeadDropdownOpen ? "open" : ""
                }`}
              >
                {teamLeads.map((teamLead) => (
                  <span key={teamLead._id} className="selected-project">
                    {teamLead.firstName + " " + teamLead.lastName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() =>
                        handleRemoveItem(teamLead, setTeamLeads, teamLeads)
                      }
                      className="close-cross"
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={teamLeadSearch}
                  onChange={(e) => setTeamLeadSearch(e.target.value)}
                  onClick={() => setTeamLeadDropdownOpen(true)}
                  placeholder="Enter work email"
                />
                {teamLeads.length === 0 && (
                  <img
                    src={teamLeadDropdownOpen ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {teamLeadDropdownOpen && (
                <div className="project-options">
                  {filterOptions(allTeamLeads, teamLeads, teamMembers)
                    .filter((teamLead) =>
                      searchFilter(teamLead, teamLeadSearch)
                    )
                    .map((teamLead) => (
                      <div
                        key={teamLead._id}
                        className="project-option"
                        onClick={() =>
                          handleAddItem(teamLead, setTeamLeads, teamLeads)
                        }
                      >
                        {teamLead.firstName + " " + teamLead.lastName}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>
              Projects<span className="red-star">*</span>
            </label>
            <div className="project-select" ref={projectDropdownRef}>
              <div
                className={`selected-projects ${
                  projectDropdownOpen ? "open" : ""
                }`}
              >
                {teamProjects.map((project) => (
                  <span key={project._id} className="selected-project">
                    {project.projectName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() =>
                        handleRemoveItem(project, setTeamProjects, teamProjects)
                      }
                      className="close-cross"
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  onClick={() => setProjectDropdownOpen(true)}
                  placeholder="Enter project name"
                />
                {teamProjects.length === 0 && (
                  <img
                    src={projectDropdownOpen ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {projectDropdownOpen && (
                <div className="project-options">
                  {filterOptions(allProjects, teamProjects)
                    .filter((project) =>
                      project.projectName
                        .toLowerCase()
                        .includes(projectSearch.toLowerCase())
                    )
                    .map((project) => (
                      <div
                        key={project._id}
                        className="project-option"
                        onClick={() =>
                          handleAddItem(project, setTeamProjects, teamProjects)
                        }
                      >
                        {project.projectName}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="permissions-section">
            <label className="permissions-text">Team Lead Permissions</label>
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
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
