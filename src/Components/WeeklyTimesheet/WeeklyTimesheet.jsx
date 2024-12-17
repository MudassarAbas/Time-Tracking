import React, { useState, useEffect } from "react";
import "./weeklyTimesheet.css";
import axios from "axios";
import { useSelector } from "react-redux";

function WeeklyTimesheet({ date, id, filterData }) {
  const [timesheetData, setTimesheetData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [data, setData] = useState({}); // State for the data from the server

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
        `http://localhost:5000/api/timesheet/weekly/${id}`,
        requestData,
        {
          headers: {
            token: accessToken,
          },
        }
      );

      // Handle successful response
      if (response.status === 200) {
        setData(response.data);
        console.log(response.data);
        setErrorMessage(""); // Clear any previous error messages
      }
    } catch (error) {
      setData([]); // Clear any previous time data
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
  }, [date, id, filterData]); // Notice that we added date, id, and filterData as the dependencies

  // Updated data structure with weekDates at the top level
  const datas = {
    weekDates: [
      "2024-09-02",
      "2024-09-03",
      "2024-09-04",
      "2024-09-05",
      "2024-09-06",
      "2024-09-07",
      "2024-09-08",
    ],
    projects: [
      {
        projectName: "Project A",
        projectInitial: "P",
        monday: "-",
        tuesday: "-",
        wednesday: "-",
        thursday: "-",
        friday: "2:16:36",
        saturday: "-",
        sunday: "-",
      },
      {
        projectName: "Project B",
        projectInitial: "P",
        monday: "-",
        tuesday: "-",
        wednesday: "-",
        thursday: "-",
        friday: "0:03:56",
        saturday: "0:46:38",
        sunday: "-",
      },
    ],
  };

  useEffect(() => {
    if (data.projects && Array.isArray(data.projects)) {
      const processedData = data.projects.map((entry) => {
        const total = calculateTotalTime([
          entry.monday,
          entry.tuesday,
          entry.wednesday,
          entry.thursday,
          entry.friday,
          entry.saturday,
          entry.sunday,
        ]);

        return {
          ...entry,
          total: convertHoursToTime(total),
        };
      });

      const allProjectsTotal = processedData.reduce(
        (acc, curr) => {
          return {
            monday: acc.monday + convertTimeToHours(curr.monday),
            tuesday: acc.tuesday + convertTimeToHours(curr.tuesday),
            wednesday: acc.wednesday + convertTimeToHours(curr.wednesday),
            thursday: acc.thursday + convertTimeToHours(curr.thursday),
            friday: acc.friday + convertTimeToHours(curr.friday),
            saturday: acc.saturday + convertTimeToHours(curr.saturday),
            sunday: acc.sunday + convertTimeToHours(curr.sunday),
          };
        },
        {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0,
        }
      );

      const allProjects = {
        projectName: "All projects",
        projectInitial: "A",
        monday: convertHoursToTime(allProjectsTotal.monday),
        tuesday: convertHoursToTime(allProjectsTotal.tuesday),
        wednesday: convertHoursToTime(allProjectsTotal.wednesday),
        thursday: convertHoursToTime(allProjectsTotal.thursday),
        friday: convertHoursToTime(allProjectsTotal.friday),
        saturday: convertHoursToTime(allProjectsTotal.saturday),
        sunday: convertHoursToTime(allProjectsTotal.sunday),
        total: convertHoursToTime(
          allProjectsTotal.monday +
            allProjectsTotal.tuesday +
            allProjectsTotal.wednesday +
            allProjectsTotal.thursday +
            allProjectsTotal.friday +
            allProjectsTotal.saturday +
            allProjectsTotal.sunday
        ),
      };

      setTimesheetData([...processedData, allProjects]);
    }
  }, [data]); // Notice that we added data as the dependency

  const convertTimeToHours = (time) => {
    if (time === "-") return 0;
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours + minutes / 60 + seconds / 3600;
  };

  const convertHoursToTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const calculateTotalTime = (times) => {
    return times
      .filter((time) => time !== "-")
      .reduce((acc, curr) => acc + convertTimeToHours(curr), 0);
  };

  return (
    <div className="weekly-timesheet">
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}
      <table className="timesheet-table">
        <thead>
          <tr>
            <th></th>
            {data && data.weekDates ? (
              data.weekDates.map((date, index) => (
                <th key={index}>
                  <div className="weekly-date-header">
                    <span className="weekly-date">
                      {new Date(date).getDate()}
                    </span>
                    <div className="weekly-day-name-and-month">
                      <span className="weekly-day-name">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </span>
                      <span className="weekly-day-month">
                        {new Date(date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </th>
              ))
            ) : (
              <th colSpan="7">No Dates Available</th>
            )}
            <th className="weekly-total-hours">Total</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            timesheetData.map((entry, index) => (
              <tr key={index}>
                <td className="project-cell">
                  <div className="project-avatar">{entry.projectName[0]}</div>
                  <span className="weekly-project-name">
                    {entry.projectName}
                  </span>
                </td>
                <td>{entry.monday}</td>
                <td>{entry.tuesday}</td>
                <td>{entry.wednesday}</td>
                <td>{entry.thursday}</td>
                <td>{entry.friday}</td>
                <td>{entry.saturday}</td>
                <td>{entry.sunday}</td>
                <td
                  className={`total-cell ${
                    entry.projectName === "All projects"
                      ? "total-cell-green"
                      : ""
                  }`}
                >
                  {entry.total}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default WeeklyTimesheet;
