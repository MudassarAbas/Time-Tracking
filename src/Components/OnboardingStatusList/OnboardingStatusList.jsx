import React, { useEffect, useState } from "react";
import searchLight from "../Assets/Search_light.png";
import flatCross from "../Assets/flat-cross.png"; // Placeholder for the reminder icon
import reminderIcon from "../Assets/Send_fill.png"; // Placeholder for the reminder icon
import flatCheckmark from "../Assets/flat_checkmark.png"; // Placeholder for the reminder icon
import "./onboardingStatusList.css";
import axios from "axios";
import { useSelector } from "react-redux";

const OnboardingStatusList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [membersData, setMembersData] = useState([]);
  const itemsPerPage = 10;
  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/onboarding",
        {
          headers: {
            token: accessToken,
          },
          // use JSON.stringyfy to convert the object into string
        }
      );
      setMembersData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [membersData]);

  const filteredOnboardings = membersData.filter((onboarding) =>
    onboarding.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOnboardings.length / itemsPerPage);
  const currentOnboardings = filteredOnboardings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div>
      <div className="onboarding-search">
        <div className="search-div">
          <img src={searchLight} alt="search" className="search-icon" />
          <input
            type="text"
            placeholder="Search for onboardings"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="onboarding-grid">
        <div className="onboarding-grid-header">
          <div className="onboarding-grid-cell onboarding-email">
            <span className="onboarding-email-heading">Member Email</span>
          </div>
          <div className="onboarding-grid-cell">Created Account</div>
          <div className="onboarding-grid-cell">Downloaded App</div>
          <div className="onboarding-grid-cell">Tracked Time</div>
          <div className="onboarding-grid-cell">Send Reminder</div>
        </div>
        {currentOnboardings &&
          currentOnboardings.map((onboarding, index) => (
            <div className="onboarding-grid-row" key={index}>
              <div className="onboarding-grid-cell onboarding-email">
                <div className="onboarding-avatar">
                  {onboarding.email.charAt(0).toUpperCase()}
                </div>
                <span>{onboarding.email}</span>
              </div>
              <div className="onboarding-grid-cell">
                {onboarding.invitationStatus === "accepted" ? (
                  <img src={flatCheckmark} alt="" />
                ) : (
                  <img src={flatCross} alt="" />
                )}
              </div>
              <div className="onboarding-grid-cell">
                {onboarding?.downloadedApp ? (
                  <img src={flatCheckmark} alt="" />
                ) : (
                  <img src={flatCross} alt="" />
                )}
              </div>
              <div className="onboarding-grid-cell">
                {onboarding?.trackedTime ? (
                  <img src={flatCheckmark} alt="" />
                ) : (
                  <img src={flatCross} alt="" />
                )}
              </div>
              <div className="onboarding-grid-cell">
                <img
                  src={reminderIcon}
                  alt="Send Reminder"
                  className="reminder-icon"
                />
              </div>
            </div>
          ))}
      </div>
      <div className="onboarding-pagination">
        <span>
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredOnboardings.length)} of{" "}
          {filteredOnboardings.length} onboardings
        </span>
        <div className="pagination-buttons">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStatusList;
