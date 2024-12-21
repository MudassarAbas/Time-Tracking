import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import chevDown from "../Assets/chevron-down.png";
import chevUp from "../Assets/chevron-up.png";
import crossIcon from "../Assets/close-cross.png";
import "./addMember.css";
import { useSelector } from "react-redux";

const AddMember = ({ show, onClose }) => {
  const [emails, setEmails] = useState([""]); // Array to store multiple emails
  const [role, setRole] = useState("user");
  const [projects, setProjects] = useState([]); // Project IDs
  const [projectNames, setProjectNames] = useState([]); // Project Names for display
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef(null);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [allProjects, setAllProjects] = useState([]); // Ensure allProjects is an empty array initially

  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const roles = [
    {
      value: "user",
      label: "User",
      description:
        "Can track and view their time for any project/work order they've added to",
    },
    {
      value: "organization-manager",
      label: "Organization Manager",
      description:
        "Can do everything, except manage financials (depending on permissions) and send payments",
    },
    {
      value: "manager",
      label: "Manager",
      description:
        "Can manage track and view reports for any projects they've added to",
    },
    {
      value: "viewer",
      label: "Viewer",
      description:
        "Can view reports for any project they've added to (viewers are free)",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (emails.length === 0 || projects.length === 0) {
      toast.error(
        "Please enter at least one email and select at least one project"
      );
      setLoading(false);
      return;
    }

    const invitePromise = axios.post(
      "http://localhost:5000/api/user/invite",
      {
        emails, // Send array of emails
        role,
        projects, // Send project IDs
      },
      {
        headers: {
          token: accessToken,
        },
      }
    );

    toast.promise(invitePromise, {
      loading: "Sending invitation...",
      success: "Invitation sent successfully!",
      error: "Failed to send invitation. Please try again.",
    });

    try {
      const response = await invitePromise;
      console.log(response.data);
      setEmails([""]); // Reset emails input
      setRole("user");
      setProjects([]);
      setProjectNames([]); // Reset project names for display
      onClose();
    } catch (err) {
      console.log("An error occurred");
    } finally {
      setLoading(false); // Re-enable the send button
    }
  };

  const handleProjectRemove = (projectId) => {
    setProjects(projects.filter((id) => id !== projectId));
    setProjectNames(projectNames.filter((project) => project.id !== projectId));
  };

  const handleProjectAdd = (project) => {
    if (!projects.includes(project._id)) {
      setProjects((prevProjects) => [...prevProjects, project._id]); // Add project ID
      setProjectNames((prevProjectNames) => [
        ...prevProjectNames,
        { id: project._id, name: project.projectName }, // Add project name for display
      ]);
    }
    setProjectSearch("");
    setProjectDropdownOpen(false);
  };

  const handleAddEmail = () => {
    setEmails([...emails, ""]);
  };

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const handleEmailRemove = (index) => {
    const updatedEmails = emails.filter((_, i) => i !== index);
    setEmails(updatedEmails);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
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
  }, [projectDropdownOpen, teamDropdownOpen, dropdownOpen]);

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
        <h2>Add Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Emails<span className="red-star">*</span>
            </label>
            {emails.map((email, index) => (
              <div key={index} className="email-input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="Add an email"
                  required
                  className="selected-value"
                  style={{ borderRadius: "10px", height: "47px" }}
                />
                {emails.length > 1 && (
                  <span
                    className="remove-email-button"
                    onClick={() => handleEmailRemove(index)}
                  >
                    <img src={crossIcon} alt="" />
                  </span>
                )}
              </div>
            ))}
            <span className="add-email-button" onClick={handleAddEmail}>
              + Invite another
            </span>
          </div>
          <div className="form-group">
            <label>Role</label>
            <div
              className={`custom-select ${dropdownOpen ? "open" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="role-select-div-arrow">
                <div className="selected-value">{role}</div>
                <img
                  src={dropdownOpen ? chevUp : chevDown}
                  alt="expand arrow"
                />
              </div>
              <div className="options">
                {roles.map((role) => (
                  <div
                    key={role.value}
                    className="option"
                    onClick={() => {
                      setRole(role.value);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="option-label">{role.label}</div>
                    <div className="option-description">{role.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="setting-section">
            <label>Projects</label>
            <p className="form-group-input-text">
              Able to track time on these projects
            </p>
            <div className={`project-select `} ref={projectDropdownRef}>
              <div
                className={`selected-projects ${
                  projectDropdownOpen ? "open" : ""
                }`}
              >
                {projectNames.map((project) => (
                  <span key={project.id} className="selected-project">
                    {project.name}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() => handleProjectRemove(project.id)}
                      className="close-cross"
                    />
                  </span>
                ))}
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    onClick={() => setProjectDropdownOpen(true)}
                    placeholder="Search and add projects"
                  />
                </div>
              </div>
              {projectDropdownOpen && (
                <div className="project-options">
                  {allProjects &&
                    allProjects
                      .filter((project) =>
                        project.projectName
                          .toLowerCase()
                          .includes(projectSearch.toLowerCase())
                      )
                      .map((project) => (
                        <div
                          key={project._id}
                          className="project-option"
                          onClick={() => handleProjectAdd(project)}
                        >
                          {project.projectName}
                        </div>
                      ))}
                </div>
              )}
            </div>
            <p className="form-group-input-text">
              Organization Owner and Managers can manage all projects by default
            </p>
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

export default AddMember;
