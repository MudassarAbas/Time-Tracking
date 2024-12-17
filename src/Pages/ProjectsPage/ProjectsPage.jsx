import React, { useState } from "react";
import MemberList from "../../Components/MemberList/MemberList";
import InviteList from "../../Components/InviteList/InviteList";
import ProjectsList from "../../Components/ProjectsList/ProjectsList";
import ArchiveProjectsList from "../../Components/ArchiveProjectsList/ArchiveProjectsList";

function ProjectsPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("active");

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div className="main-universal-div">
      <div className="main-universal-content">
        <div className="members-top-section">
          <h2>Projects</h2>
          <div className="members-tabs">
            <button
              className={`members-tab ${
                currentTab === "active" ? "active" : ""
              }`}
              onClick={() => handleTabChange("active")}
            >
              Active
            </button>
            <button
              className={`members-tab ${
                currentTab === "archive" ? "active" : ""
              }`}
              onClick={() => handleTabChange("archive")}
            >
              Archive
            </button>
          </div>
        </div>

        {currentTab === "active" && (
          <ProjectsList showModal={showModal} toggleModal={toggleModal} />
        )}
        {currentTab === "archive" && (
          <ArchiveProjectsList
            showModal={showModal}
            toggleModal={toggleModal}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;
