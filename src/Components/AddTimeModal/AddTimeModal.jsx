import React, { useEffect, useState, useRef } from "react";
import "./addTimeModal.css";
import axios from "axios";
import crossIcon from "../Assets/close-cross.png";
import chevDown from "../Assets/chevron-down.png";
import chevUp from "../Assets/chevron-up.png";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const AddTimeModal = ({ show, onClose, selectedMember }) => {
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA") // 'en-CA' format gives YYYY-MM-DD
  );
  const [fromTime, setFromTime] = useState("08:00");
  const [toTime, setToTime] = useState("09:00");
  const [reason, setReason] = useState("forgot");
  const [allProjects, setAllProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef(null);
  const [projects, setProjects] = useState([]); // Project IDs
  const [projectNames, setProjectNames] = useState([]); // Project Names for display
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;

  const submit = async () => {
    if (
      projects.length == 0 ||
      date === "" ||
      fromTime === "" ||
      toTime === "" ||
      reason === ""
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    if (projects.length > 1) {
      toast.error("Please select only one project");
      return;
    }
    if (new Date(`${date}T${fromTime}`) >= new Date(`${date}T${toTime}`)) {
      toast.error("From time must be earlier than to time");
      return;
    }

    console.log({
      project: projects[0],
      date,
      fromTime: `${fromTime}:00`,
      toTime: `${toTime}:00`,
      reason,
    });
    try {
      const response = await axios.post(
        `http://localhost:5000/api/timesheet/add-time/${selectedMember._id}`,
        {
          project: projects[0],
          date,
          fromTime: `${fromTime}:00`,
          toTime: `${toTime}:00`,
          reason,
        },
        {
          headers: {
            token: accessToken,
          },
        }
      );
      console.log(response.data);
      toast.success(response.data.message);
    } catch (error) {
      if (error.response) {
        console.error("Server responded with error:", error.response.data);
        toast.error(error.response.data.message); // Show specific error message from backend
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Please try again.");
      } else {
        console.error("Error setting up request:", error.message);
        toast.error(
          "Error occurred while sending the request. Please try again."
        );
      }
    }

    onClose(); // Close modal after sending data
  };

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
  }, [projectDropdownOpen, dropdownOpen]);

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

  const reasons = [
    {
      value: "forgot",
      label: "Forgot to Start/Stop Timmer ",
    },
    {
      value: "wrong",
      label: "Used a wrong task/project",
    },
    {
      value: "away",
      label: "Was AFK on a call",
    },
    {
      value: "other",
      label: "Other",
    },
  ];

  // Now handle the return null if show is false after hooks
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Add Time</h2>
        <div className="user-info">
          <div className="avatar"></div>
          <p className="user-name">
            {selectedMember.firstName + " " + selectedMember.lastName}
          </p>
        </div>
        <div className="add-time-project-name">
          Project Name<span className="red-star">*</span>
        </div>
        <div className={`project-select `} ref={projectDropdownRef}>
          <div
            className={`selected-projects ${projectDropdownOpen ? "open" : ""}`}
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

        <div className="modal-label">
          Time Span (PKT) <span className="red-star">*</span>
        </div>
        <div className="time-span">
          <input
            type="date"
            className="modal-input"
            value={date}
            defualtValue={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
          />
          <span className="time-to">from</span>
          <input
            type="time"
            className="modal-input time-input"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
          />
          <span className="time-to">to</span>
          <input
            type="time"
            className="modal-input time-input"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
          />
        </div>

        <div className="modal-label">Reason</div>
        <div
          className={`custom-select ${dropdownOpen ? "open" : ""}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="reason-select-div-arrow add-time-selected-resons">
            <div className="selected-value">
              {reasons.map((item) => {
                if (item.value === reason) {
                  return item.label; // Return the label of the selected reason
                }
              })}
            </div>
            <img src={dropdownOpen ? chevUp : chevDown} alt="expand arrow" />
          </div>
          <div className="options">
            {reasons.map((reason) => (
              <div
                key={reason.value}
                className="option"
                onClick={() => {
                  setReason(reason.value);
                  setDropdownOpen(false);
                }}
              >
                <div className="option-label">{reason.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button send" onClick={submit}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTimeModal;
