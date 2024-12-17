import React, { useEffect, useRef, useState } from "react";
import "./dailyTimesheet.css";
import chevronDown from "../Assets/chevron-down.png";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import EditTimeModal from "../EditTimeModal/EditTimeModal";

function DailyTimesheet({ selectedRangeDate, id, filterData }) {
  console.log("id", id);

  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const dropdownRefs = useRef([]);
  const actionButtonRefs = useRef([]);
  const [timeData, setTimeData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;
  const { startDate, endDate } = selectedRangeDate;
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const editTimeLog = (entry, date) => {
    setSelectedLog({ entry, date });
    setEditModalOpen(true);
  };

  const fetchData = async () => {
    try {
      const requestData = {
        startDate,
        endDate,
        projects: filterData.selectedProjects,
        source: filterData.selectedSource,
        timeType: filterData.selectedTimeType,
        activity: filterData.selectedActivityLevel
          ? Number(filterData.selectedActivityLevel.replace(">", ""))
          : null,
      };

      const response = await axios.post(
        `http://localhost:5000/api/timesheet/daily/${id}`,
        requestData,
        {
          headers: {
            token: accessToken,
          },
        }
      );

      if (response.status === 200) {
        setTimeData(response.data);
        setErrorMessage("");
        console.log("response.data", response.data);
      }
    } catch (error) {
      setTimeData([]);
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage("Start date and end date are required.");
        } else if (error.response.status === 404) {
          setErrorMessage("No timer logs found for the specified date range.");
        } else {
          setErrorMessage("An error occurred: " + error.response.data.message);
        }
      } else if (error.request) {
        setErrorMessage("Unable to reach the server. Please try again later.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, id, filterData]);

  const convertToSeconds = (time) => {
    const [hours, minutes, seconds, period] = time
      .match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i)
      .slice(1);
    let totalSeconds =
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

    if (period.toUpperCase() === "PM" && hours !== "12") {
      totalSeconds += 12 * 3600;
    } else if (period.toUpperCase() === "AM" && hours === "12") {
      totalSeconds -= 12 * 3600;
    }

    return totalSeconds;
  };

  const calculateDailyTotalWorkedSeconds = (logs) => {
    return logs.reduce((dayAcc, range) => {
      const startSeconds = convertToSeconds(range.start);
      const endSeconds = convertToSeconds(range.end);
      const duration = endSeconds - startSeconds;
      return dayAcc + duration;
    }, 0);
  };

  const convertToPercentage = (seconds) => {
    return (seconds / (24 * 3600)) * 100;
  };

  const totalWorkedSeconds = (timeData || []).reduce((acc, day) => {
    if (Array.isArray(day.logs)) {
      const dayTotal = calculateDailyTotalWorkedSeconds(day.logs);
      return acc + dayTotal;
    }
    return acc;
  }, 0);

  const totalWorkedHours = Math.floor(totalWorkedSeconds / 3600);
  const totalWorkedMinutes = Math.floor((totalWorkedSeconds % 3600) / 60);
  const totalWorkedRemainderSeconds = totalWorkedSeconds % 60;

  const handleDropdownToggle = (index) => {
    setDropdownOpenIndex(index === dropdownOpenIndex ? null : index);
  };

  const deleteTimeLog = async (log, date) => {
    const { start, end } = log;
    console.log("Deleting log entry", log);
    console.log("Date", date);
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/timesheet/${id}/${date}`,
        {
          data: {
            startTime: start,
            stopTime: end,
          },
          headers: {
            token: accessToken,
          },
        }
      );

      if (response.status === 200) {
        console.log("Log entry deleted successfully");
        toast.success(response.data.message);
        // Refetch or filter the updated timeData to remove the deleted log
        setTimeData((prevData) =>
          prevData.map((day) =>
            day.date === date
              ? {
                  ...day,
                  logs: day.logs.filter(
                    (entry) => entry.start !== start || entry.end !== end
                  ),
                }
              : day
          )
        );
      }
    } catch (error) {
      console.error("Error deleting log entry", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpenIndex !== null) {
        const dropdownNode = dropdownRefs.current[dropdownOpenIndex];
        const actionButtonNode = actionButtonRefs.current[dropdownOpenIndex];
        if (
          dropdownNode &&
          !dropdownNode.contains(event.target) &&
          actionButtonNode &&
          !actionButtonNode.contains(event.target)
        ) {
          setDropdownOpenIndex(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpenIndex]);

  const formatTime = (time) => {
    const [hours, minutes, seconds, period] = time
      .match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i)
      .slice(1);
    return `${hours}:${minutes} ${period}`; // Return formatted time
  };

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    // Check if the date is today
    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return "Today";
    }

    // Format the date as "Sun, Sep 22, 2024"
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight for comparison

  const sortedTimeData = timeData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // Place today at the top, then sort older dates in descending order
    if (dateA.getTime() === today.getTime()) return -1; // Today comes first
    if (dateB.getTime() === today.getTime()) return 1; // Today comes first
    return dateB - dateA; // Sort older dates in descending order
  });

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}
      <div>
        {sortedTimeData.map((day, dayIndex) => {
          const dailyTotalWorkedSeconds = calculateDailyTotalWorkedSeconds(
            day.logs
          );
          const dailyWorkedHours = Math.floor(dailyTotalWorkedSeconds / 3600);
          const dailyWorkedMinutes = Math.floor(
            (dailyTotalWorkedSeconds % 3600) / 60
          );
          const dailyWorkedRemainderSeconds = dailyTotalWorkedSeconds % 60;

          return (
            <div key={dayIndex}>
              <div className="daily-date">
                <h3>
                  {formatDate(day.date)} {" : "}
                  {` ${String(dailyWorkedHours).padStart(2, "0")}:${String(
                    dailyWorkedMinutes
                  ).padStart(2, "0")}:${String(
                    dailyWorkedRemainderSeconds
                  ).padStart(2, "0")}`}
                </h3>
              </div>

              <div className="time-bar-container">
                <div className="time-bar">
                  {day.logs.map((range, logIndex) => {
                    const startSeconds = convertToSeconds(range.start);
                    const endSeconds = convertToSeconds(range.end);
                    const widthPercentage =
                      convertToPercentage(endSeconds) -
                      convertToPercentage(startSeconds);
                    const startPercentage = convertToPercentage(startSeconds);
                    return (
                      <div
                        key={`${dayIndex}-${logIndex}`}
                        className="time-segment"
                        style={{
                          left: `${startPercentage}%`,
                          width: `${widthPercentage}%`,
                        }}
                        title={`${range.start} - ${range.end}`}
                      ></div>
                    );
                  })}
                </div>
                <div className="time-bar-markers">
                  <div className="time-marker" style={{ left: "25%" }}>
                    6 AM
                  </div>
                  <div className="time-marker" style={{ left: "50%" }}>
                    12 PM
                  </div>
                  <div className="time-marker" style={{ left: "75%" }}>
                    6 PM
                  </div>
                </div>
              </div>
              <div className="daily-timesheet-grid">
                <div className="invite-grid-header">
                  <div className="invite-grid-cell invite-email">Project</div>
                  <div className="invite-grid-cell">Activity</div>
                  <div className="invite-grid-cell">Idle</div>
                  <div className="invite-grid-cell">Manual</div>
                  <div className="invite-grid-cell">Duration</div>
                  <div className="invite-grid-cell">Time</div>
                  <div className="invite-grid-cell"></div>
                </div>
                {day.logs.map((entry, logIndex) => (
                  <div
                    className="invite-grid-row"
                    key={`${dayIndex}-${logIndex}`}
                  >
                    <div className="invite-grid-cell invite-email">
                      <div className="invite-avatar">
                        {entry.projectName.charAt(0).toUpperCase()}
                      </div>
                      <span>{entry.projectName}</span>
                    </div>
                    <div className="invite-grid-cell">
                      {parseInt(entry.activity)}%
                    </div>
                    <div className="invite-grid-cell">{entry.idle}</div>
                    <div className="invite-grid-cell">{entry.manual}</div>
                    <div className="invite-grid-cell">{entry.duration}</div>
                    <div className="invite-grid-cell">
                      {formatTime(entry.start)} - {formatTime(entry.end)}
                    </div>
                    <div
                      className="invite-grid-cell"
                      style={{ position: "relative" }}
                    >
                      <div
                        className="invite-actions-button"
                        onClick={() =>
                          handleDropdownToggle(`${dayIndex}-${logIndex}`)
                        }
                        ref={(el) =>
                          (actionButtonRefs.current[`${dayIndex}-${logIndex}`] =
                            el)
                        }
                      >
                        <p>Actions</p>
                        <img
                          src={chevronDown}
                          alt="chevron down"
                          className="invite-action-chevron"
                        />
                      </div>
                      {dropdownOpenIndex === `${dayIndex}-${logIndex}` && (
                        <div
                          className="custom-dropdown-menu invite-custom-dropdown-menu"
                          ref={(el) =>
                            (dropdownRefs.current[`${dayIndex}-${logIndex}`] =
                              el)
                          }
                        >
                          <div onClick={() => editTimeLog(entry, day.date)}>
                            Edit this time entry
                          </div>
                          <div onClick={() => deleteTimeLog(entry, day.date)}>
                            Delete this time entry
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {isEditModalOpen && selectedLog && (
        <EditTimeModal
          show={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          selectedLog={selectedLog.entry}
          userId={id} // or whichever userId you need
          date={selectedLog.date}
        />
      )}
    </div>
  );
}

export default DailyTimesheet;
