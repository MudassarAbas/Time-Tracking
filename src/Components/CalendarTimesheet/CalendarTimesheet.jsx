import React, { useEffect, useState } from "react";
import "./calendarTimesheet.css";
import axios from "axios";
import { useSelector } from "react-redux";

const CalendarTimesheet = ({ date, id, filterData }) => {
  const [userData, setUserData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;
  const fetchData = async () => {
    try {
      const requestData = {
        date, // Assuming endDate is already defined (e.g., "2024-09-12")
        projects: filterData.selectedProjects, // Direct mapping from selectedProjects to projects
        source: filterData.selectedSource, // Direct mapping from selectedSource to source
        timeType: filterData.selectedTimeType, // Direct mapping from selectedTimeType to timeType
        activity: filterData.selectedActivityLevel
          ? Number(filterData.selectedActivityLevel.replace(">", ""))
          : null, // or a default value like 0 or undefined // Convert ">80" to 80
      };

      const response = await axios.post(
        `http://localhost:5000/api/timesheet/calendar/${id}`,
        requestData,
        {
          headers: {
            token: accessToken,
          },
        }
      );

      // Handle successful response
      if (response.status === 200) {
        setUserData(response.data);
        setErrorMessage(""); // Clear any previous error messages
        console.log(response.data);
      }
    } catch (error) {
      setUserData([]); // Clear any previous time data
      // Handle different types of errors
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 400) {
          setErrorMessage("Start date and end date are required.");
        } else if (error.response.status === 404) {
          setErrorMessage("No timer logs found for the specified date range.");
        } else {
          setErrorMessage("An error occurred: " + error.response.data.message);
        }
      } else if (error.request) {
        // No response was received
        setErrorMessage("Unable to reach the server. Please try again later.");
      } else {
        // Something else caused the error
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    if (date && id) {
      fetchData();
    }
  }, [date, id, filterData]);
  // const userDatas = [
  //   {
  //     date: "2024-08-05",
  //     tasks: [
  //       {
  //         startTime: "00:01",
  //         endTime: "01:02",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "01:03",
  //         endTime: "02:04",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "02:05",
  //         endTime: "02:06",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "02:06",
  //         endTime: "02:06",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "02:06",
  //         endTime: "02:10",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "08:05",
  //         endTime: "15:14",
  //         description: "Graphic Designing",
  //       },
  //     ],
  //   },
  //   {
  //     date: "2024-08-06",
  //     tasks: [
  //       {
  //         startTime: "00:00",
  //         endTime: "06:00",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "08:05",
  //         endTime: "15:14",
  //         description: "Graphic Designing",
  //       },
  //     ],
  //   },
  //   {
  //     date: "2024-08-07",
  //     tasks: [
  //       {
  //         startTime: "00:00",
  //         endTime: "03:00",
  //         description: "Graphic Designing",
  //       },
  //     ],
  //   },
  //   {
  //     date: "2024-08-08",
  //     tasks: [],
  //   },
  //   {
  //     date: "2024-08-09",
  //     tasks: [],
  //   },
  //   {
  //     date: "2024-08-10",
  //     tasks: [
  //       {
  //         startTime: "00:00",
  //         endTime: "00:04",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "00:05",
  //         endTime: "01:10",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "01:10",
  //         endTime: "01:12",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "02:00",
  //         endTime: "03:00",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "18:00",
  //         endTime: "20:00",
  //         description: "Graphic Designing",
  //       },
  //       {
  //         startTime: "22:00",
  //         endTime: "23:00",
  //         description: "Graphic Designing",
  //       },
  //     ],
  //   },
  //   {
  //     date: "2024-08-11",
  //     tasks: [],
  //   },
  // ];

  // Adjust time to grid row calculation for 15-minute intervals (4 per hour)

  const timeToGridRow = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 4 + Math.floor(minutes / 15) + 1;
  };

  const isOverlap = (task1, task2) => {
    return task1.startTime < task2.endTime && task2.startTime < task1.endTime;
  };

  const getOverlapCount = (tasks, currentTaskIndex) => {
    const currentTask = tasks[currentTaskIndex];
    return tasks.reduce((count, task, index) => {
      if (index !== currentTaskIndex && isOverlap(task, currentTask)) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const formatTimeLabel = (hour) => {
    const isAM = hour < 12;
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${isAM ? "am" : "pm"}`;
  };
  return (
    <div className="calendar-timesheet">
      <div className="week-header">
        <div className="time-label-column"></div> {/* Empty for alignment */}
        {/* Add an empty day header */}
        <div className="empty-day-header"></div>
        {userData.map((data, index) => (
          <div key={index} className="day-header">
            <span className="day-date">{new Date(data.date).getDate()}</span>
            <div className="day-name-and-month">
              <span className="day-name">
                {new Date(data.date).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </span>
              <span className="day-month">
                {new Date(data.date).toLocaleDateString("en-US", {
                  month: "short",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="week-body">
        <div className="time-label-column">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="hour-label">
              <p>{formatTimeLabel(hour)}</p>
            </div>
          ))}
        </div>
        {/* Add an empty day column */}
        <div className="empty-day-column">
          {Array.from({ length: 96 }, (_, interval) => (
            <div key={interval} className="hour-row"></div>
          ))}
        </div>
        {userData.map((data, index) => (
          <div key={index} className="day-column">
            {Array.from({ length: 96 }, (_, interval) => (
              <div key={interval} className="hour-line"></div>
            ))}
            {data.tasks.map((task, taskIndex) => {
              const overlapCount = getOverlapCount(data.tasks, taskIndex);
              const columnSpan =
                overlapCount === 0
                  ? "1 / span 7"
                  : `1 / span ${overlapCount + 1}`;

              return (
                <div
                  key={taskIndex}
                  className={`task-block ${
                    taskIndex > 0 && isOverlap(data.tasks[taskIndex - 1], task)
                      ? "overlap"
                      : ""
                  }`}
                  style={{
                    gridRowStart: timeToGridRow(task.startTime),
                    gridRowEnd: timeToGridRow(task.endTime),
                    gridColumn: columnSpan,
                    marginTop:
                      taskIndex === 0 ||
                      !isOverlap(data.tasks[taskIndex - 1], task)
                        ? "2px"
                        : "0",
                  }}
                >
                  <div className="task-time">
                    {task.startTime} - {task.endTime}
                  </div>
                  <div className="task-description">{task.project}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarTimesheet;
