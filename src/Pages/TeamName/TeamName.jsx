import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import TeamMemberList from "../../Components/TeamMemberList/TeamMemberList";
import TeamProjectList from "../../Components/TeamProjectList/TeamProjectList";
import TeamInvitesList from "../../Components/TeamInvitesList/TeamInvitesList";
import TeamOnboardingStatusList from "../../Components/TeamOnboardingStatusList/TeamOnboardingStatusList";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import edit from "../../Components/Assets/edit.png";
import copy from "../../Components/Assets/copy.png";
import transfer from "../../Components/Assets/transfer.png";
import archive from "../../Components/Assets/archive.png";
import delete_img from "../../Components/Assets/delete.png";
import "./teamName.css";
import EditPermissions from "../../Components/EditPeermissions/EditPermissions";
import toast, { Toaster } from "react-hot-toast";

function TeamName() {
  const [showModal, setShowModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("members");
  const [teamDetails, setTeamDetails] = useState();
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.auth.token);
  const { id } = useParams();

  const fetchTeamDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/team/team-id/${id}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setTeamDetails(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, []);

  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const togglePermissionsModal = () => {
    setShowPermissionsModal(!showPermissionsModal);
  };

  const deleteTeam = (teamId) => async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this team?"
    );
    if (!confirmDelete) return;
    try {
      const responce = await axios.delete(
        `http://localhost:5000/api/team/delete/${teamId}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      toast.success(responce.data.message);
      navigate("/people/teams");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete team");
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  if (!teamDetails) {
    return <div>Loading...</div>; // or show a loading spinner
  }

  return (
    <div className="main-universal-div">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="main-universal-content">
        <div className="members-top-section">
          <div className="teams-details-top-bar">
            <h2>{teamDetails && teamDetails.teamName}</h2>
            <div>
              <div className="project-actions">
                <button className="edit-btn" onClick={togglePermissionsModal}>
                  <img src={edit} alt="" />
                  Edit Permission
                </button>
                {/* <button className="duplicate-btn">
                  <img src={copy} alt="" />
                  Duplicate
                </button>
                <button className="transfer-btn">
                  <img src={transfer} alt="" />
                  Transfer
                </button>
                <button className="archive-btn">
                  <img src={archive} alt="" />
                  <span>Archive</span>
                </button> */}
                <button className="delete-btn" onClick={deleteTeam(id)}>
                  <img src={delete_img} alt="" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
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
                currentTab === "projects" ? "active" : ""
              }`}
              onClick={() => handleTabChange("projects")}
            >
              Projects
            </button>
            <button
              className={`members-tab ${
                currentTab === "invites" ? "active" : ""
              }`}
              onClick={() => handleTabChange("invites")}
            >
              Invites
            </button>
            <button
              className={`members-tab ${
                currentTab === "onboarding" ? "active" : ""
              }`}
              onClick={() => handleTabChange("onboarding")}
            >
              Onboarding Status
            </button>
          </div>
        </div>
        {currentTab === "members" && teamDetails && (
          <TeamMemberList
            showModal={showModal}
            toggleModal={toggleModal}
            teamDetails={teamDetails}
            fetchTeamDetails={fetchTeamDetails}
          />
        )}
        {currentTab === "projects" && teamDetails && (
          <TeamProjectList
            showModal={showModal}
            toggleModal={toggleModal}
            teamDetails={teamDetails}
            fetchTeamDetails={fetchTeamDetails}
          />
        )}
        {currentTab === "invites" && teamDetails && (
          <TeamInvitesList showModal={showModal} toggleModal={toggleModal} />
        )}
        {currentTab === "onboarding" && <TeamOnboardingStatusList />}
      </div>
      <EditPermissions
        show={showPermissionsModal}
        onClose={togglePermissionsModal}
        initialPermissions={teamDetails && teamDetails.permissions}
        initialSubPermissions={teamDetails && teamDetails.subPermissions}
        teamId={teamDetails && teamDetails.teamId}
      />
    </div>
  );
}

export default TeamName;
