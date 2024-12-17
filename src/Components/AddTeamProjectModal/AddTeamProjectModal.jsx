import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import crossIcon from "../Assets/close-cross.png";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

function AddTeamProjectModal({ show, onClose, fetchTeamDetails, teamDetails }) {
  const { id } = useParams();
  const [allProjects, setAllProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const accessToken = useSelector((state) => state.auth.token);
  const projectDropdownRef = useRef(null);

  useEffect(() => {
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

    fetchProjects();
  }, [accessToken]);

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
  }, [projectDropdownOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const invitePromise = axios.put(
      `http://localhost:5000/api/team/add-project/${id}`,
      {
        projects: projects.map((project) => project._id),
      },
      {
        headers: {
          token: accessToken,
        },
      }
    );

    toast.promise(invitePromise, {
      loading: "Adding projects...",
      success: "Projects added successfully!",
      error: "Failed to add projects. Please try again.",
    });

    try {
      await invitePromise;
      setProjects([]);
      onClose();
      fetchTeamDetails(); // Refetch the team details to update the component
    } catch (err) {
      console.log("An error occurred", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAdd = (project) => {
    if (!projects.some((p) => p._id === project._id)) {
      setProjects([...projects, project]);
    }
    setProjectSearch("");
    setProjectDropdownOpen(false);
  };

  const handleProjectRemove = (project) => {
    setProjects(projects.filter((p) => p._id !== project._id));
  };

  if (!show) {
    return null;
  }

  const searchFilter = (item, search) =>
    item.projectName.toLowerCase().includes(search.toLowerCase());

  // Filter out projects that are already part of the team
  const filteredProjects = allProjects.filter(
    (project) => !teamDetails.teamProjects.some((tp) => tp._id === project._id)
  );

  return (
    <div className="modal-overlay">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Add Project</h2>
        <form onSubmit={handleSubmit}>
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
                {projects.map((project) => (
                  <span key={project._id} className="selected-project">
                    {project.projectName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() => handleProjectRemove(project)}
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
                  {filteredProjects
                    .filter((project) => searchFilter(project, projectSearch))
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
              Organization owner and managers can manage all projects by default
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
}

export default AddTeamProjectModal;
