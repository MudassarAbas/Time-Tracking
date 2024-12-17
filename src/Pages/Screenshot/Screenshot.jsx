import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import "./screenshot.css";
import calendar from "../../Components/Assets/calendar.png";
import chevronDown from "../../Components/Assets/chevron-down.png";
import userIcon from "../../Components/Assets/userImage.png";
import settings from "../../Components/Assets/Settings=Active.png";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { Calendar } from "react-date-range";
import FilterModal from "../../Components/FilterModal/FilterModal";
import searchLight from "../../Components/Assets/Search_light.png";
import axios from "axios";
import { useSelector } from "react-redux";
import ScreenshotsTenMinutes from "../../Components/ScreenshotsTenMinutes/ScreenshotsTenMinutes";
import ScreenshotAll from "../../Components/ScreenshotAll/ScreenshotAll";

function Screenshot() {
  const [currentTab, setCurrentTab] = useState("screenshot-ten-minutes");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allMembers, setAllMembers] = useState([]);
  const [filterValues, setFilterValues] = useState({
    selectedMember: null,
    selectedProjects: [],
    selectedTimeType: [],
    selectedSource: [],
    selectedActivityLevel: null,
  });

  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/all-users",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setAllMembers(response.data);
      if (response.data.length > 0) {
        setSelectedMember(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [accessToken]);

  const calendarRef = useRef(null);
  const memberModalRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (
        memberModalRef.current &&
        !memberModalRef.current.contains(event.target)
      ) {
        setMemberModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  function formatDateRange(dateRange) {
    const formatDate = (date) => {
      return date.toLocaleDateString("en-CA");
    };

    return {
      startDate: formatDate(dateRange.startDate),
      endDate: formatDate(dateRange.endDate),
    };
  }

  const formattedRange = formatDateRange(selectedRange);

  const handleMemberModalToggle = () => {
    setMemberModal(!memberModal);
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setMemberModal(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFilterSubmit = (filterData) => {
    setFilterValues(filterData);
    setSelectedMember(
      allMembers.find((member) => member._id === filterData.selectedMember)
    );
  };

  return (
    <div className="main-universal-content">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="screenshot-container">
        <div className="screenshot-header">
          <h2>Screenshots</h2>
          <div className="date-picker-main-div">
            <div className="date-picker" onClick={handleCalendarToggle}>
              <div className="date-picker-value">
                {selectedDate.toLocaleDateString("en-CA")}
              </div>
              <button className="calendar-button">
                <img
                  src={calendar}
                  alt="Calendar Icon"
                  className="screenshots-calender-icon"
                />
              </button>
            </div>
            <div className="calender-modal" ref={calendarRef}>
              {showCalendar && (
                <Calendar
                  date={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                />
              )}
            </div>
            <div className="timezone-selector">
              <div className="timezone-dropdown">
                PKT <img src={chevronDown} alt="" />
              </div>
            </div>
          </div>
        </div>
        <div className="screenshot-tabs">
          <button
            className={`tab ${
              currentTab === "screenshot-ten-minutes" ? "active" : ""
            }`}
            onClick={() => handleTabChange("screenshot-ten-minutes")}
          >
            Every 10 min
          </button>
          <button
            className={`tab ${currentTab === "screenshot-all" ? "active" : ""}`}
            onClick={() => handleTabChange("screenshot-all")}
          >
            All screenshots
          </button>
        </div>
        <div className="screenshot-actions">
          <div className="action-buttons">
            <div className="settings">
              <img src={settings} alt="" /> Settings
            </div>
            <div className="action-buttons-middle-div">
              <div className="form-group">
                <div
                  className="user-selector"
                  onClick={handleMemberModalToggle}
                >
                  <img
                    src={userIcon}
                    alt="User Icon"
                    className="user-selector-user-icon"
                  />
                  <div>
                    {selectedMember
                      ? `${selectedMember.firstName} ${selectedMember.lastName}`
                      : "Select a member"}
                  </div>
                </div>
                {memberModal && (
                  <div
                    className="screenshot-member-selection-modal"
                    ref={memberModalRef}
                  >
                    <div className="screenshot-modal-content">
                      <div className="search-input">
                        <img
                          src={searchLight}
                          alt="search"
                          className="search-icon"
                        />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          placeholder="Search members"
                        />
                      </div>
                      <ul className="member-list">
                        {allMembers
                          .filter((member) =>
                            `${member.firstName} ${member.lastName}`
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          )
                          .map((member) => (
                            <li
                              key={member._id}
                              className={`member-item ${
                                selectedMember &&
                                selectedMember._id === member._id
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => handleMemberSelect(member)}
                            >
                              <img
                                src={userIcon}
                                alt="User Icon"
                                className="user-icon"
                              />
                              {`${member.firstName} ${member.lastName}`}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <button className="filters-button" onClick={openModal}>
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      {currentTab === "screenshot-ten-minutes" && selectedMember && (
        <ScreenshotsTenMinutes
          selectedRangeDate={formattedRange}
          id={selectedMember._id}
          filterData={filterValues}
        />
      )}
      {currentTab === "screenshot-all" && selectedMember && (
        <ScreenshotAll
          date={selectedDate.toLocaleDateString("en-CA")}
          id={selectedMember._id}
          filterData={filterValues}
        />
      )}
      {selectedMember && (
        <FilterModal
          show={isModalOpen}
          onClose={closeModal}
          selectedMemberId={selectedMember._id}
          onSubmit={handleFilterSubmit}
        />
      )}
    </div>
  );
}

export default Screenshot;
