import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import "./timesheet.css";
import calendar from "../../Components/Assets/calendar.png";
import chevronDown from "../../Components/Assets/chevron-down.png";
import userIcon from "../../Components/Assets/userImage.png";
import settings from "../../Components/Assets/Settings=Active.png";
import DailyTimesheet from "../../Components/DailyTimesheet/DailyTimesheet";
import CalendarTimesheet from "../../Components/CalendarTimesheet/CalendarTimesheet";
import WeeklyTimesheet from "../../Components/WeeklyTimesheet/WeeklyTimesheet";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { Calendar } from "react-date-range";
import { DateRangePicker } from "react-date-range";
import FilterModal from "../../Components/FilterModal/FilterModal";
import searchLight from "../../Components/Assets/Search_light.png";
import axios from "axios";
import { useSelector } from "react-redux";
import AddTimeModal from "../../Components/AddTimeModal/AddTimeModal";

function Timesheet() {
  const [currentTab, setCurrentTab] = useState("daily");
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
  const handleSelectRange = (ranges) => {
    setSelectedRange(ranges.selection);
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate && startDate !== endDate) {
      setShowCalendar(false);
    }
  };

  function formatDateRange(dateRange) {
    const formatDate = (date) => {
      // Use toLocaleDateString to get the date in local time zone in YYYY-MM-DD format
      return date.toLocaleDateString("en-CA"); // 'en-CA' locale gives the date in YYYY-MM-DD format
    };

    // console.log(selectedRange);
    return {
      startDate: formatDate(dateRange.startDate),
      endDate: formatDate(dateRange.endDate),
    };
  }

  const formattedRange = formatDateRange(selectedRange);
  // console.log(formattedRange);

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

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const openTimeModal = () => setIsTimeModalOpen(true);
  const closeTimeModal = () => setIsTimeModalOpen(false);

  const handleFilterSubmit = (filterData) => {
    // Update the state with the new filter values
    setFilterValues(filterData);
    setSelectedMember(
      allMembers.find((member) => member._id === filterData.selectedMember)
    );
    console.log("Filter values:", filterData);
  };

  return (
    <div className="main-universal-div">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="main-universal-content">
        <div className="timesheet-container">
          <div className="timesheet-header">
            <h2>View & edit timesheets</h2>
            <div className="date-picker-main-div">
              <div className="date-picker" onClick={handleCalendarToggle}>
                <div className="date-picker-value">
                  {currentTab === "daily"
                    ? `${selectedRange.startDate.toLocaleDateString()} - ${selectedRange.endDate.toLocaleDateString()}`
                    : selectedDate.toLocaleDateString("en-CA")}
                </div>
                <button className="calendar-button">
                  <img
                    src={calendar}
                    alt="Calendar Icon"
                    className="timesheets-calender-icon"
                  />
                </button>
              </div>
              <div className="calender-modal" ref={calendarRef}>
                {showCalendar && currentTab === "daily" && (
                  <DateRangePicker
                    ranges={[selectedRange]}
                    onChange={handleSelectRange}
                    showSelectionPreview={true}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    direction="horizontal"
                  />
                )}
                {showCalendar && currentTab !== "daily" && (
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
          <div className="timesheet-tabs">
            <button
              className={`tab ${currentTab === "daily" ? "active" : ""}`}
              onClick={() => handleTabChange("daily")}
            >
              Daily
            </button>
            <button
              className={`tab ${currentTab === "weekly" ? "active" : ""}`}
              onClick={() => handleTabChange("weekly")}
            >
              Weekly
            </button>
            <button
              className={`tab ${currentTab === "calendar" ? "active" : ""}`}
              onClick={() => handleTabChange("calendar")}
            >
              Calendar
            </button>
          </div>
          <div className="timesheet-actions">
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
                      className="timesheet-member-selection-modal"
                      ref={memberModalRef}
                    >
                      <div className="timesheet-modal-content">
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
              <button className="add-time-button" onClick={openTimeModal}>
                Add time
              </button>
            </div>
          </div>
        </div>
        {currentTab === "daily" && selectedMember && (
          <DailyTimesheet
            selectedRangeDate={formattedRange}
            id={selectedMember._id}
            filterData={filterValues}
          />
        )}
        {currentTab === "weekly" && selectedMember && (
          <WeeklyTimesheet
            date={selectedDate.toLocaleDateString("en-CA")}
            id={selectedMember._id}
            filterData={filterValues}
          />
        )}
        {currentTab === "calendar" && selectedMember && (
          <CalendarTimesheet
            date={selectedDate.toLocaleDateString("en-CA")}
            id={selectedMember._id}
            filterData={filterValues}
          />
        )}
      </div>
      {selectedMember && (
        <FilterModal
          show={isModalOpen}
          onClose={closeModal}
          selectedMemberId={selectedMember._id}
          onSubmit={handleFilterSubmit}
        />
      )}
      {selectedMember && (
        <AddTimeModal
          show={isTimeModalOpen}
          onClose={closeTimeModal}
          selectedMember={selectedMember}
        />
      )}
    </div>
  );
}

export default Timesheet;
