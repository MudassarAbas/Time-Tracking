import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ProjectTeamList from "../../Components/ProjectTeamList/ProjectTeamList";
import ProjectMemberList from "../../Components/ProjectMemberList/ProjectMemberList";
import "./projectDetailsPage.css";
import edit from "../../Components/Assets/edit.png";
import copy from "../../Components/Assets/copy.png";
import transfer from "../../Components/Assets/transfer.png";
import archive from "../../Components/Assets/archive.png";
import delete_img from "../../Components/Assets/delete.png";
import MemberList from "../../Components/MemberList/MemberList";
import Team from "../People-Team/Team";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import EditProjectModal from "../../Components/EditProjectModal/EditProjectModal";

function ProjectDeailsPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("members");
  const [projectData, setProjectData] = useState();
  const accessToken = useSelector((state) => state.auth.token);
  const { id } = useParams();
  const navigate = useNavigate();

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/project/project-details/${id}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setProjectData(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const addToArchive = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to archive?");
    if (!confirmDelete) return;
    try {
      const responce = await axios.post(
        `http://localhost:5000/api/project/archive/${id}`,
        {},
        {
          headers: {
            token: accessToken,
          },
        }
      );
      // fetchProjects();
      console.log(responce.data.message);
      toast.success(responce.data.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive project");
    }
  };

  const deleteProject = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    try {
      const responce = await axios.delete(
        `http://localhost:5000/api/project/delete/${id}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      // fetchProjects();
      console.log(responce.data.message);
      toast.success(responce.data.message);
      navigate("/projects");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete member");
    }
  };

  return (
    <div className="main-universal-div">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="main-universal-content">
        <div className="project-details">
          {projectData && (
            <div className="project-details-top">
              <div className="project-header">
                <h2>Projects</h2>
              </div>
              <div>
                <div className="project-actions">
                  <button className="edit-btn" onClick={toggleModal}>
                    <img src={edit} alt="" />
                    Edit
                  </button>
                  <button className="duplicate-btn">
                    <img src={copy} alt="" />
                    Duplicate
                  </button>
                  <button className="transfer-btn">
                    <img src={transfer} alt="" />
                    Transfer
                  </button>
                  <button
                    className="archive-btn"
                    onClick={() => addToArchive(projectData._id)}
                  >
                    <img src={archive} alt="" />
                    <span>Archive</span>
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteProject(projectData._id)}
                  >
                    <img src={delete_img} alt="" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {projectData && (
            <div className="project-details-bottom">
              <h3>{projectData.projectName}</h3>
              <div className="project-info">
                <div>
                  <p>
                    <span>Client: </span>None
                  </p>
                  <p>
                    <span>Status: </span>
                    <span className="status-active">
                      {projectData.projectStatus == "active"
                        ? "Active"
                        : "Archived"}
                    </span>
                  </p>
                  <p>
                    <span>No to-dos</span>
                  </p>
                </div>
                <div>
                  <p>
                    <span>Last active: </span>Mon, Mar 4, 2024 - 6:10pm
                  </p>
                  <p>
                    <span>Billable: </span>No
                  </p>
                  <p>
                    <span>Budget: </span>None
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {projectData && (
          <div>
            <div className="members-tabs">
              <button
                className={`members-tab ${
                  currentTab === "members" ? "active" : ""
                }`}
                onClick={() => handleTabChange("members")}
              >
                MEMBERS
              </button>
              <button
                className={`members-tab ${
                  currentTab === "teams" ? "active" : ""
                }`}
                onClick={() => handleTabChange("teams")}
              >
                TEAMS
              </button>
            </div>
            {currentTab === "members" && (
              <ProjectMemberList
                showModal={showModal}
                toggleModal={toggleModal}
                membersData={projectData.projectUsers}
                projectId={projectData._id}
              />
            )}
            {currentTab === "teams" && (
              <ProjectTeamList
                showModal={showModal}
                toggleModal={toggleModal}
                teamsData={projectData.projectTeams}
              />
            )}
          </div>
        )}
      </div>
      {showModal && (
        <EditProjectModal
          show={showModal}
          onClose={toggleModal}
          projectId={projectData._id}
        />
      )}
    </div>
  );
}

export default ProjectDeailsPage;
