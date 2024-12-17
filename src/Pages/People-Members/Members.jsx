import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import MemberList from "../../Components/MemberList/MemberList";
import InviteList from "../../Components/InviteList/InviteList";
import "./membersPage.css";
import OnboardingStatusList from "../../Components/OnboardingStatusList/OnboardingStatusList";

function Members() {
  const [showModal, setShowModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("members");

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
          <h2>Members</h2>
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
                currentTab === "invites" ? "active" : ""
              }`}
              onClick={() => handleTabChange("invites")}
            >
              INVITES
            </button>
            <button
              className={`members-tab ${
                currentTab === "onboarding" ? "active" : ""
              }`}
              onClick={() => handleTabChange("onboarding")}
            >
              ONBOARDING STATUS
            </button>
          </div>
        </div>
        {currentTab === "members" && (
          <MemberList showModal={showModal} toggleModal={toggleModal} />
        )}
        {currentTab === "invites" && (
          <InviteList showModal={showModal} toggleModal={toggleModal} />
        )}
        {currentTab === "onboarding" && <OnboardingStatusList />}
      </div>
    </div>
  );
}

export default Members;
