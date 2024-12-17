import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./memberManagement.css";
import Sidebar from "../../Components/Sidebar/Sidebar";
import img from "../../Components/Assets/userImage.png";
import chevDown from "../../Components/Assets/chevron-down.png";
import chevUp from "../../Components/Assets/chevron-up.png";
import goBack from "../../Components/Assets/go_back.png";
import crossIcon from "../../Components/Assets/close-cross.png";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const MemberManagement = () => {
  const [memberData, setMemberData] = useState(null);
  const [allowedApps, setAllowedApps] = useState("desktop");
  const [idleTimeout, setIdleTimeout] = useState(15);
  const [idleTimeoutType, setIdleTimeoutType] = useState("15");
  const [keepIdleTime, setKeepIdleTime] = useState("never");
  const [role, setRole] = useState("user");
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [teamLeads, setTeamLeads] = useState([]);
  const [teamLeadSearch, setTeamLeadSearch] = useState("");
  const [teamLeadDropdownOpen, setTeamLeadDropdownOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [idleDropdownOpen, setIdleDropdownOpen] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

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
      console.log("All Projects: ", response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/team/get-all",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setAllTeams(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeams();
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

  const fetchMemberData = async () => {
    const response = await axios.get(
      `http://localhost:5000/api/user/user-id/${id}`,
      {
        headers: {
          token: accessToken,
        },
      }
    );
    console.log("Respoce Data: ", response.data);

    setMemberData(response.data);
    const teamLeadsArray = [];
    const teamsArray = response.data.teams
      .map((team) => {
        const teamObj = {
          id: team.teamId,
          name: team.teamName,
          ...team,
        };
        if (team.isTeamLead) {
          teamLeadsArray.push(teamObj);
          return null;
        }
        return teamObj;
      })
      .filter((team) => team !== null);

    setTeams(teamsArray);
    setTeamLeads(teamLeadsArray);

    setProjects(
      response.data.projects
        .filter((project) => project !== null)
        .map((project) => ({
          id: project.projectId,
          name: project.projectName,
        }))
    );

    setAllowedApps(response.data.allowedApps);
    setIdleTimeoutType(response.data.idleTimeOut);
    setKeepIdleTime(response.data.keepIdleTime);
    // }
  };

  useEffect(() => {
    fetchMemberData();
  }, [allProjects, allTeams, id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        projectDropdownOpen &&
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setProjectDropdownOpen(false);
      }
      if (
        teamDropdownOpen &&
        teamDropdownRef.current &&
        !teamDropdownRef.current.contains(event.target)
      ) {
        setTeamDropdownOpen(false);
      }
      if (
        teamLeadDropdownOpen &&
        teamLeadDropdownRef.current &&
        !teamLeadDropdownRef.current.contains(event.target)
      ) {
        setTeamLeadDropdownOpen(false);
      }
      if (
        dropdownOpen &&
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
      if (
        idleDropdownOpen &&
        idleDropdownRef.current &&
        !idleDropdownRef.current.contains(event.target)
      ) {
        setIdleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    projectDropdownOpen,
    teamDropdownOpen,
    teamLeadDropdownOpen,
    dropdownOpen,
    idleDropdownOpen,
  ]);

  const handleSaveChanges = async () => {
    setLoading(true);
    const updatedMemberData = {
      allowedApps,
      idleTimeout: idleTimeoutType === "never" ? "never" : idleTimeout,
      keepIdleTime,
      role,
      projects: projects.map((project) => project.id),
      teams: teams
        .map((team) => ({
          teamId: team.id,
          teamRole: "user",
          isTeamLead: false,
        }))
        .concat(
          teamLeads.map((team) => ({
            teamId: team.id,
            teamRole: "manager",
            isTeamLead: true,
          }))
        ),
    };
    console.log(updatedMemberData);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/user/update-user/${id}`,
        updatedMemberData,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAdd = (project) => {
    if (!projects.some((p) => p.id === project.id)) {
      setProjects([...projects, project]);
    }
    setProjectSearch("");
    setProjectDropdownOpen(false);
  };

  const handleProjectRemove = (projectId) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  const handleTeamAdd = (team) => {
    if (!teams.some((t) => t.id === team.id)) {
      setTeams([...teams, team]);
      setTeamLeads(teamLeads.filter((tl) => tl.id !== team.id));
    }
    setTeamSearch("");
    setTeamDropdownOpen(false);
  };

  const handleTeamRemove = (teamId) => {
    setTeams(teams.filter((t) => t.id !== teamId));
  };

  const handleTeamLeadAdd = (teamLead) => {
    if (!teamLeads.some((t) => t.id === teamLead.id)) {
      setTeamLeads([...teamLeads, teamLead]);
      setTeams(teams.filter((t) => t.id !== teamLead.id));
    }
    setTeamLeadSearch("");
    setTeamLeadDropdownOpen(false);
  };

  const handleTeamLeadRemove = (teamLeadId) => {
    setTeamLeads(teamLeads.filter((tl) => tl.id !== teamLeadId));
  };

  const handleIdleTimeoutChange = (e) => {
    const value = e.target.value;
    setIdleTimeout(value === "never" ? "never" : parseInt(value));
  };

  const projectDropdownRef = useRef(null);
  const teamDropdownRef = useRef(null);
  const teamLeadDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const idleDropdownRef = useRef(null);

  function formattedDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short", // abbreviated day of the week
      year: "numeric",
      month: "short", // abbreviated month
      day: "numeric",
    });
  }

  if (!memberData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-universal-div">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="main-universal-content">
        <div className="member-management">
          <div className="members-navigate-back">
            <img src={goBack} alt="Go Back" />
            <p className="members-navigate-back-text">Members</p>
          </div>
          <div className="members-management-member-info">
            <div>
              <h3>{memberData.firstName + " " + memberData.lastName}</h3>
              <div className="members-info-details">
                <div className="members-info-details-left">
                  <img src={img} alt="" className="" />
                  <p>Joined:</p>
                  <p>{formattedDate(memberData.dateAdded)}</p>
                </div>
                <div className="members-info-details-right">
                  <p>{memberData.email}</p>
                  <p>{memberData.timeZone}</p>
                  <p>Last tracked time: {memberData.lastTrackedTime}</p>
                </div>
              </div>
            </div>
            <button className="save-changes-button" onClick={handleSaveChanges}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
          <div className="member-settings">
            <div className="member-settings-left">
              <div className="form-group setting-section">
                <label>Role</label>
                <div
                  className={`custom-select ${dropdownOpen ? "open" : ""}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  ref={roleDropdownRef}
                >
                  <div className="role-select-div-arrow">
                    <div className="selected-value">{role}</div>
                    <img
                      src={dropdownOpen ? chevUp : chevDown}
                      alt="expand arrow"
                    />
                  </div>
                  <div className="options">
                    {roles.map((roleOption) => (
                      <div
                        key={roleOption.value}
                        className="option"
                        onClick={() => {
                          setRole(roleOption.value);
                          setDropdownOpen(false);
                        }}
                      >
                        <div className="option-label">{roleOption.label}</div>
                        <div className="option-description">
                          {roleOption.description}
                        </div>
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
                <div className="project-select" ref={projectDropdownRef}>
                  <div
                    className={`selected-projects ${
                      projectDropdownOpen ? "open" : ""
                    }`}
                  >
                    {projects &&
                      projects.map((project) => (
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
                      {allProjects
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
                              handleProjectAdd({
                                id: project._id,
                                name: project.projectName,
                              })
                            }
                          >
                            {project.projectName}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <p className="form-group-input-text">
                  Organization owner and managers can manage all projects by
                  default
                </p>
              </div>
              <div className="setting-section">
                <label className="team-label">Teams</label>
                <p className="form-group-input-text">Member in these teams</p>
                <div className="project-select" ref={teamDropdownRef}>
                  <div
                    className={`selected-projects ${
                      teamDropdownOpen ? "open" : ""
                    }`}
                  >
                    {teams.map((team) => (
                      <span key={team.id} className="selected-project">
                        {team.name}
                        <img
                          src={crossIcon}
                          alt="remove"
                          onClick={() => handleTeamRemove(team.id)}
                          className="close-cross"
                        />
                      </span>
                    ))}
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                        onClick={() => setTeamDropdownOpen(true)}
                        placeholder="Search and add teams"
                      />
                    </div>
                  </div>
                  {teamDropdownOpen && (
                    <div className="project-options">
                      {allTeams
                        .filter((team) =>
                          team.teamName
                            .toLowerCase()
                            .includes(teamSearch.toLowerCase())
                        )
                        .map((team) => (
                          <div
                            key={team._id}
                            className="project-option"
                            onClick={() =>
                              handleTeamAdd({
                                id: team._id,
                                name: team.teamName,
                              })
                            }
                          >
                            {team.teamName}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="setting-section">
                <p className="form-group-input-text">
                  Manages these teams as <b>Team lead</b>
                </p>
                <div className="project-select" ref={teamLeadDropdownRef}>
                  <div
                    className={`selected-projects ${
                      teamLeadDropdownOpen ? "open" : ""
                    }`}
                  >
                    {teamLeads.map((teamLead) => (
                      <span key={teamLead.id} className="selected-project">
                        {teamLead.name}
                        <img
                          src={crossIcon}
                          alt="remove"
                          onClick={() => handleTeamLeadRemove(teamLead.id)}
                          className="close-cross"
                        />
                      </span>
                    ))}
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={teamLeadSearch}
                        onChange={(e) => setTeamLeadSearch(e.target.value)}
                        onClick={() => setTeamLeadDropdownOpen(true)}
                        placeholder="Search and add team leads"
                      />
                    </div>
                  </div>
                  {teamLeadDropdownOpen && (
                    <div className="project-options">
                      {allTeams
                        .filter((team) =>
                          team.teamName
                            .toLowerCase()
                            .includes(teamLeadSearch.toLowerCase())
                        )
                        .map((team) => (
                          <div
                            key={team._id}
                            className="project-option"
                            onClick={() =>
                              handleTeamLeadAdd({
                                id: team._id,
                                name: team.teamName,
                              })
                            }
                          >
                            {team.teamName}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="member-settings-right">
              <div className="setting-section">
                <label className="allowed-apps-label">Allowed Apps</label>
                <div>
                  <button
                    onClick={() => setAllowedApps("all")}
                    className={allowedApps === "all" ? "active" : ""}
                  >
                    All Apps
                  </button>
                  <button
                    onClick={() => setAllowedApps("desktop")}
                    className={allowedApps === "desktop" ? "active" : ""}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setAllowedApps("mobile")}
                    className={allowedApps === "mobile" ? "active" : ""}
                  >
                    Mobile
                  </button>
                </div>
              </div>
              <div className="setting-section">
                <label className="idle-timeout-label">Idle Timeout</label>
                <div className="idle-timeout-wrapper">
                  <div
                    className={`custom-select ${
                      idleDropdownOpen ? "open" : ""
                    }`}
                    onClick={() => setIdleDropdownOpen(!idleDropdownOpen)}
                    ref={idleDropdownRef}
                  >
                    <div className="role-select-div-arrow">
                      <div className="selected-value">
                        {idleTimeoutType === "never"
                          ? "never"
                          : idleTimeoutType === "Custom"
                          ? "Custom"
                          : `${idleTimeoutType} Min`}
                      </div>
                      <img
                        src={idleDropdownOpen ? chevUp : chevDown}
                        alt="expand arrow"
                      />
                    </div>
                    <div className="options">
                      {[
                        { value: "Custom", label: "Custom" },
                        { value: "never", label: "Never" },
                        { value: "5", label: "5 Min" },
                        { value: "10", label: "10 Min" },
                        { value: "15", label: "15 Min" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className="option"
                          onClick={() => {
                            if (option.value === "Custom") {
                              setIdleTimeoutType("Custom");
                              setIdleTimeout(5); // Default custom value to 5 minutes
                            } else if (option.value === "never") {
                              setIdleTimeoutType("never");
                              setIdleTimeout("never");
                            } else {
                              setIdleTimeoutType(option.value);
                              setIdleTimeout(parseInt(option.value));
                            }
                            setIdleDropdownOpen(false);
                          }}
                        >
                          <div className="option-label">{option.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {idleTimeoutType === "Custom" && (
                    <div className="custom-idle-time">
                      <input
                        type="number"
                        value={idleTimeout}
                        onChange={handleIdleTimeoutChange}
                      />
                      <div>Min</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="setting-section">
                <label className="keep-idle-timeout-label">
                  Keep Idle Time
                </label>
                <div>
                  <button
                    onClick={() => setKeepIdleTime("prompt")}
                    className={keepIdleTime === "prompt" ? "active" : ""}
                  >
                    Prompt
                  </button>
                  <button
                    onClick={() => setKeepIdleTime("never")}
                    className={keepIdleTime === "never" ? "active" : ""}
                  >
                    Never
                  </button>
                  <button
                    onClick={() => setKeepIdleTime("always")}
                    className={keepIdleTime === "always" ? "active" : ""}
                  >
                    Always
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;
