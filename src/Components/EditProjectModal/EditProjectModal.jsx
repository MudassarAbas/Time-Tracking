import React, { useEffect, useRef, useState } from "react";
import chevDown from "../Assets/chevron-down.png";
import chevUp from "../Assets/chevron-up.png";
import crossIcon from "../Assets/close-cross.png";
import "./editProjectModal.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

function EditProjectModal({ show, onClose, projectId }) {
  const [projectName, setProjectName] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewers, setViewers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const accessToken = useSelector((state) => state.auth.token);

  const fetchOptions = async () => {
    try {
      // Fetch members and teams from API
      const membersResponse = await axios.get(
        "http://localhost:5000/api/user/all-users",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      const teamsResponse = await axios.get(
        "http://localhost:5000/api/team/get-all",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setAllMembers(membersResponse.data);
      console.log("membersResponse.data", teamsResponse.data); // Log response data
      setAllTeams(teamsResponse.data);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/project/edit/${projectId}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      const project = response.data;

      // Ensure projectUsers is an array of objects with user and role
      const formattedProjectUsers = project.projectUsers.map((pu) => ({
        user: pu.user,
        role: pu.role,
      }));

      setProjectName(project.projectName);
      setManagers(
        formattedProjectUsers
          .filter((user) => user.role === "manager")
          .map((user) => user.user)
      );
      setUsers(
        formattedProjectUsers
          .filter((user) => user.role === "user")
          .map((user) => user.user)
      );
      setViewers(
        formattedProjectUsers
          .filter((user) => user.role === "viewer")
          .map((user) => user.user)
      );
      setTeams(project.projectTeams.map((team) => team));
    } catch (error) {
      toast.error("Failed to load project details");
      console.error(error);
    }
  };

  useEffect(() => {
    if (show) {
      fetchOptions();
      fetchProjectDetails();
    }
  }, [show]);

  const handleAddItem = (item, setItems, items) => {
    if (!items.some((i) => i._id === item._id)) {
      setItems([...items, item]);
    }
  };

  const handleRemoveItem = (item, setItems, items) => {
    setItems(items.filter((i) => i._id !== item._id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      projectName,
      projectUsers: [
        ...managers.map((m) => ({ userId: m._id, role: "manager" })),
        ...users.map((u) => ({ userId: u._id, role: "user" })),
        ...viewers.map((v) => ({ userId: v._id, role: "viewer" })),
      ],
      projectTeams: teams.map((t) => t._id),
    };
    console.log(data);
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/project/update/${projectId}`,
        data,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      toast.success("Project updated successfully!");
      setProjectName("");
      setManagers([]);
      setUsers([]);
      setViewers([]);
      setTeams([]);
      onClose();
    } catch (error) {
      toast.error("Failed to update project");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const dropdownRefs = useRef([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpenIndex !== null) {
        const dropdownNode = dropdownRefs.current[dropdownOpenIndex];
        if (dropdownNode && !dropdownNode.contains(event.target)) {
          setDropdownOpenIndex(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpenIndex]);

  if (!show) {
    return null;
  }

  const filterOptions = (options, selectedItems, selectedInOtherLists = []) =>
    options.filter(
      (option) =>
        !selectedItems.some((item) => item._id === option._id) &&
        !selectedInOtherLists.some((item) => item._id === option._id)
    );

  const searchFilter = (item, search) =>
    item.firstName.toLowerCase().includes(search.toLowerCase()) ||
    item.lastName.toLowerCase().includes(search.toLowerCase()) ||
    `${item.firstName} ${item.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());

  const filteredMembersForManagers = filterOptions(allMembers, managers, [
    ...users,
    ...viewers,
  ]);

  const filteredMembersForUsers = filterOptions(allMembers, users, [
    ...managers,
    ...viewers,
  ]);

  const filteredMembersForViewers = filterOptions(allMembers, viewers, [
    ...managers,
    ...users,
  ]);

  return (
    <div className="modal-overlay">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Edit Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Project Name<span className="red-star">*</span>
            </label>
            <input
              style={{ borderRadius: "10px", height: "47px" }}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="form-group">
            <label>Add Managers</label>
            <p className="form-group-input-text">
              Oversees and manages the project
            </p>
            <div
              className="project-select"
              ref={(el) => (dropdownRefs.current[0] = el)}
            >
              <div
                className={`selected-projects ${
                  dropdownOpenIndex === 0 ? "open" : ""
                }`}
                onClick={() =>
                  setDropdownOpenIndex(dropdownOpenIndex === 0 ? null : 0)
                }
              >
                {managers.map((member) => (
                  <span key={member._id} className="selected-project">
                    {member.firstName + " " + member.lastName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() =>
                        handleRemoveItem(member, setManagers, managers)
                      }
                      className="close-cross"
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Select managers"
                />
                {dropdownOpenIndex === 0 && (
                  <img
                    src={dropdownOpenIndex === 0 ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {dropdownOpenIndex === 0 && (
                <div className="project-options">
                  {filteredMembersForManagers
                    .filter((member) => searchFilter(member, searchQuery))
                    .map((member) => (
                      <div
                        key={member._id}
                        className="project-option"
                        onClick={() =>
                          handleAddItem(member, setManagers, managers)
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
            <label>Add Users</label>
            <p className="form-group-input-text">Works on the project</p>
            <div
              className="project-select"
              ref={(el) => (dropdownRefs.current[1] = el)}
            >
              <div
                className={`selected-projects ${
                  dropdownOpenIndex === 1 ? "open" : ""
                }`}
                onClick={() =>
                  setDropdownOpenIndex(dropdownOpenIndex === 1 ? null : 1)
                }
              >
                {users.map((member) => (
                  <span key={member._id} className="selected-project">
                    {member.firstName + " " + member.lastName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() => handleRemoveItem(member, setUsers, users)}
                      className="close-cross"
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Select users"
                />
                {dropdownOpenIndex === 1 && (
                  <img
                    src={dropdownOpenIndex === 1 ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {dropdownOpenIndex === 1 && (
                <div className="project-options">
                  {filteredMembersForUsers
                    .filter((member) => searchFilter(member, searchQuery))
                    .map((member) => (
                      <div
                        key={member._id}
                        className="project-option"
                        onClick={() => handleAddItem(member, setUsers, users)}
                      >
                        {member.firstName + " " + member.lastName}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Add Viewers</label>
            <p className="form-group-input-text">Views the project</p>
            <div
              className="project-select"
              ref={(el) => (dropdownRefs.current[2] = el)}
            >
              <div
                className={`selected-projects ${
                  dropdownOpenIndex === 2 ? "open" : ""
                }`}
                onClick={() =>
                  setDropdownOpenIndex(dropdownOpenIndex === 2 ? null : 2)
                }
              >
                {viewers.map((member) => (
                  <span key={member._id} className="selected-project">
                    {member.firstName + " " + member.lastName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() =>
                        handleRemoveItem(member, setViewers, viewers)
                      }
                      className="close-cross"
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Select viewers"
                />
                {dropdownOpenIndex === 2 && (
                  <img
                    src={dropdownOpenIndex === 2 ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {dropdownOpenIndex === 2 && (
                <div className="project-options">
                  {filteredMembersForViewers
                    .filter((member) => searchFilter(member, searchQuery))
                    .map((member) => (
                      <div
                        key={member._id}
                        className="project-option"
                        onClick={() =>
                          handleAddItem(member, setViewers, viewers)
                        }
                      >
                        {member.firstName + " " + member.lastName}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          {/* <div className="form-group">
            <label>Add Teams</label>
            <p className="form-group-input-text">
              The teams working on this project
            </p>
            <div
              className="project-select"
              ref={(el) => (dropdownRefs.current[3] = el)}
            >
              <div
                className={`selected-projects ${
                  dropdownOpenIndex === 3 ? "open" : ""
                }`}
                onClick={() =>
                  setDropdownOpenIndex(dropdownOpenIndex === 3 ? null : 3)
                }
              >
                {teams &&
                  teams.map((team) => (
                    <span key={team._id} className="selected-project">
                      {team.teamName}
                      <img
                        src={crossIcon}
                        alt="remove"
                        onClick={() => handleRemoveItem(team, setTeams, teams)}
                        className="close-cross"
                      />
                    </span>
                  ))}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Select teams"
                />
                {dropdownOpenIndex === 3 && (
                  <img
                    src={dropdownOpenIndex === 3 ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {dropdownOpenIndex === 3 && (
                <div className="project-options">
                  {allTeams
                    .filter(
                      (team) =>
                        !teams.some((t) => t._id === team._id) &&
                        team.teamName
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                    .map((team) => (
                      <div
                        key={team._id}
                        className="project-option"
                        onClick={() => handleAddItem(team, setTeams, teams)}
                      >
                        {team.teamName}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div> */}
          <div className="form-group update-button-form-group">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="send-button update-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating Project..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProjectModal;
