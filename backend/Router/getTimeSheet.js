const router = require("express").Router();
const UserData = require("../Modals/UserDataModal");
const User = require("../Modals/UserModal");
const moment = require("moment");
const dotenv = require("dotenv");
const TimerLogModal = require("../Modals/userTimerLogModal");
const ProjectModal = require("../Modals/projectModal");
const ActivityModal = require("../Modals/activityTrackerModal");
const { verifyToken } = require("./verifyToken");
const { default: mongoose } = require("mongoose");
const TimerLog = require("../Modals/userTimerLogModal");
const Activity = require("../Modals/activityTrackerModal");
require("moment-duration-format");

dotenv.config();

// Get User Time Sheet
router.post("/daily/:id", async (req, res) => {
  console.log("Request to get user timesheet");
  try {
    const id = req.params.id;
    const { startDate, endDate, projects, source, timeType, activity } =
      req.body;

    // Validate dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
    const formattedEndDate = moment(endDate).format("YYYY-MM-DD");

    // Build the query object
    const query = {
      user: id,
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
    };

    // Add filters conditionally
    if (projects && projects.length > 0) {
      query.project = { $in: projects };
    }
    if (source && source.length > 0) {
      query.source = { $in: source };
    }
    if (timeType && timeType.length > 0) {
      query.timeType = { $in: timeType };
    }

    // Fetch timer logs
    const timerLogs = await TimerLogModal.find(query);

    if (!timerLogs || timerLogs.length === 0) {
      return res.status(404).json({
        message:
          "No timer logs found for this user within the specified date range",
      });
    }

    // Fetch activities
    const activities = await ActivityModal.find({
      user: id,
      startDate: { $gte: formattedStartDate, $lte: formattedEndDate },
    });

    // Group the logs by date
    const groupedLogs = timerLogs.reduce((acc, log) => {
      const logDate = log.date;
      if (!acc[logDate]) acc[logDate] = [];
      acc[logDate].push(log);
      return acc;
    }, {});

    // Process logs
    const result = await Promise.all(
      Object.keys(groupedLogs).map(async (date) => {
        const logsForDate = groupedLogs[date];
        console.log("Logs:", logsForDate);

        const logs = await Promise.all(
          logsForDate.map(async (timerLog) => {
            return await Promise.all(
              timerLog.logs.map(async (log) => {
                const startTime = moment(log.startTime, "HH:mm:ss");
                const endTime = moment(log.stopTime, "HH:mm:ss");

                // Filter activities that overlap with the timer log period
                const matchingActivities = activities.filter(
                  (activity) =>
                    moment(activity.startTime, "HH:mm:ss").isSameOrBefore(
                      endTime
                    ) &&
                    moment(activity.endTime, "HH:mm:ss").isSameOrAfter(
                      startTime
                    )
                );

                // Calculate average activity rate for this log's duration
                const totalActivityRate = matchingActivities.reduce(
                  (sum, activity) => sum + activity.activityRate,
                  0
                );
                const averageActivityRate =
                  matchingActivities.length > 0
                    ? (totalActivityRate / matchingActivities.length).toFixed(2)
                    : "0";

                // Filter by activity rate if provided
                if (activity && averageActivityRate < activity) {
                  return null; // Skip logs that don't meet the activity threshold
                }

                // Calculate the duration of the timer log
                const timerDuration = moment
                  .duration(endTime.diff(startTime))
                  .format("H:mm:ss", { trim: false });

                // Fetch the project name
                let projectName = "Unknown";
                if (timerLog.project && timerLog.project._id) {
                  const project = await ProjectModal.findById(
                    timerLog.project._id
                  ).select("projectName");
                  projectName = project ? project.projectName : "Unknown";
                }

                // Process the log based on timeType from timerLog (not log)
                const timeLogEntry = {
                  projectName: projectName || "Unknown",
                  activity: "0%", // Default value for activity
                  idle: "0%", // Default value for idle time
                  manual: "0%", // Default value for manual time
                  start: startTime.format("hh:mm:ss A"),
                  end: endTime.format("hh:mm:ss A"),
                  duration: timerDuration,
                };

                // Adjust columns based on timerLog.timeType
                if (timerLog.timeType === "manual") {
                  console.log("Manual time log", timerLog);
                  timeLogEntry.activity = `${averageActivityRate}%`;
                  // Set manual time to "100%" when timeType is manual
                  timeLogEntry.manual = "100%";
                } else if (timerLog.timeType === "idle") {
                  console.log("Idle time log", timerLog);
                  timeLogEntry.idle = timerDuration;
                } else {
                  console.log("Activity time log", timerLog);
                  timeLogEntry.activity = `${averageActivityRate}%`;
                }

                return timeLogEntry;
              })
            );
          })
        );

        // Return date and associated logs, filter out null logs
        return { date, logs: logs.flat().filter((log) => log !== null) };
      })
    );

    // Respond with the transformed data
    res
      .status(200)
      .json(result.filter((logsPerDate) => logsPerDate.logs.length > 0)); // Filter out dates with no logs
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const formatDate = (date) => moment(date).format("YYYY-MM-DD"); // Format to 'YYYY-MM-DD'
const calculateDuration = (startTime, stopTime) => {
  const start = moment(startTime, "HH:mm:ss");
  const stop = moment(stopTime, "HH:mm:ss");
  return moment.duration(stop.diff(start));
};

// API to get week data based on a single date
router.post("/weekly/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { date, projects, source, timeType, activity } = req.body; // Date format: "YYYY-MM-DD"

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get the start of the week (Monday) and the end of the week (Sunday) around the given date
    const inputDate = moment(date, "YYYY-MM-DD");
    const startOfWeek = inputDate.clone().startOf("isoWeek"); // Monday
    const endOfWeek = inputDate.clone().endOf("isoWeek"); // Sunday

    // Format week dates for response
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(formatDate(startOfWeek.clone().add(i, "days"))); // Push formatted dates as 'YYYY-MM-DD'
    }

    // Build the query object for filtering
    const query = {
      user: userId,
      date: {
        $gte: startOfWeek.format("YYYY-MM-DD"),
        $lte: endOfWeek.format("YYYY-MM-DD"),
      },
    };

    // Apply filters conditionally
    if (projects && projects.length > 0) {
      query.project = { $in: projects };
    }
    if (source && source.length > 0) {
      query.source = { $in: source };
    }
    if (timeType && timeType.length > 0) {
      query.timeType = { $in: timeType };
    }

    // Find timer logs for the user within the week range
    const timerLogs = await TimerLogModal.find(query).populate("project");

    // Fetch activities within the same date range
    const activities = await ActivityModal.find({
      user: userId,
      startDate: {
        $gte: startOfWeek.format("YYYY-MM-DD"),
        $lte: endOfWeek.format("YYYY-MM-DD"),
      },
    });

    // Group logs by project and date
    const projectData = {};
    timerLogs.forEach((log) => {
      const logDate = moment(log.date).isoWeekday(); // 1 = Monday, 7 = Sunday
      const projectName = log.project.projectName;
      const projectInitial = projectName.charAt(0).toUpperCase();

      if (!projectData[projectName]) {
        projectData[projectName] = {
          projectName,
          projectInitial,
          monday: "-",
          tuesday: "-",
          wednesday: "-",
          thursday: "-",
          friday: "-",
          saturday: "-",
          sunday: "-",
        };
      }

      const dayKey = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ][logDate - 1];

      // Calculate total duration for that day and filter by activity rate if provided
      const totalDuration = log.logs.reduce((acc, logEntry) => {
        const startTime = moment(logEntry.startTime, "HH:mm:ss");
        const stopTime = moment(logEntry.stopTime, "HH:mm:ss");

        // Filter activities that overlap with the timer log period
        const matchingActivities = activities.filter(
          (activityLog) =>
            moment(activityLog.startTime, "HH:mm:ss").isSameOrBefore(
              stopTime
            ) &&
            moment(activityLog.endTime, "HH:mm:ss").isSameOrAfter(startTime)
        );

        // Calculate average activity rate for this log's duration
        const totalActivityRate = matchingActivities.reduce(
          (sum, activityLog) => sum + activityLog.activityRate,
          0
        );
        const averageActivityRate =
          matchingActivities.length > 0
            ? (totalActivityRate / matchingActivities.length).toFixed(2)
            : "0";

        // Filter by activity rate if provided
        if (activity && averageActivityRate < activity) {
          return acc; // Skip logs that don't meet the activity threshold
        }

        return acc.add(
          calculateDuration(logEntry.startTime, logEntry.stopTime)
        );
      }, moment.duration(0));

      projectData[projectName][dayKey] = totalDuration.format("H:mm:ss", {
        trim: false,
      });
    });

    // Format response
    const response = {
      weekDates,
      projects: Object.values(projectData),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Helper function to format time
const formatTime = (time) => moment(time, "HH:mm:ss").format("HH:mm");

// API to get weekly task data based on a single date
router.post("/calendar/:id", async (req, res) => {
  console.log("Request to get weekly task data");

  try {
    const userId = req.params.id;
    const { date, projects, source, timeType, activity } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get the start and end of the week (Monday to Sunday) around the given date
    const inputDate = moment(date, "YYYY-MM-DD");
    const startOfWeek = inputDate.clone().startOf("isoWeek"); // Monday
    const endOfWeek = inputDate.clone().endOf("isoWeek"); // Sunday

    // Build the query object for filtering
    const query = {
      user: userId,
      date: {
        $gte: startOfWeek.format("YYYY-MM-DD"),
        $lte: endOfWeek.format("YYYY-MM-DD"),
      },
    };

    // Apply filters conditionally
    if (projects && projects.length > 0) {
      query.project = { $in: projects };
    }
    if (source && source.length > 0) {
      query.source = { $in: source };
    }
    if (timeType && timeType.length > 0) {
      query.timeType = { $in: timeType };
    }

    // Find timer logs for the user within the week range
    const timerLogs = await TimerLogModal.find(query).populate("project");

    // Fetch activities within the same date range
    const activities = await ActivityModal.find({
      user: userId,
      startDate: {
        $gte: startOfWeek.format("YYYY-MM-DD"),
        $lte: endOfWeek.format("YYYY-MM-DD"),
      },
    });

    // Initialize week data structure (Monday to Sunday)
    const weekData = [];
    for (let i = 0; i < 7; i++) {
      weekData.push({
        date: startOfWeek.clone().add(i, "days").format("YYYY-MM-DD"),
        tasks: [],
      });
    }

    // Process timer logs and map them into the appropriate day
    for (const log of timerLogs) {
      const logDate = moment(log.date).format("YYYY-MM-DD");

      // Find the corresponding day in the weekData array
      const dayData = weekData.find((day) => day.date === logDate);

      for (const logEntry of log.logs) {
        // Fetch the project name
        const project = await ProjectModal.findById(log.project._id).select(
          "projectName"
        );

        // Calculate activity rate for this log entry
        const startTime = moment(logEntry.startTime, "HH:mm:ss");
        const stopTime = moment(logEntry.stopTime, "HH:mm:ss");

        // Filter activities that overlap with the timer log period
        const matchingActivities = activities.filter(
          (activityLog) =>
            moment(activityLog.startTime, "HH:mm:ss").isSameOrBefore(
              stopTime
            ) &&
            moment(activityLog.endTime, "HH:mm:ss").isSameOrAfter(startTime)
        );

        // Calculate average activity rate for this log's duration
        const totalActivityRate = matchingActivities.reduce(
          (sum, activityLog) => sum + activityLog.activityRate,
          0
        );
        const averageActivityRate =
          matchingActivities.length > 0
            ? (totalActivityRate / matchingActivities.length).toFixed(2)
            : "0";

        // Filter by activity rate if provided
        if (activity && averageActivityRate < activity) {
          continue; // Skip logs that don't meet the activity threshold
        }

        // Push each log entry to the corresponding day
        dayData.tasks.push({
          startTime: formatTime(logEntry.startTime),
          endTime: formatTime(logEntry.stopTime),
          project: project.projectName,
        });
      }
    }

    res.status(200).json(weekData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const calculateTotalDuration = (startTime, stopTime) => {
  const start = moment(startTime, "HH:mm:ss");
  const stop = moment(stopTime, "HH:mm:ss");
  return moment.duration(stop.diff(start));
};

// API to get total worked time for a specific date
router.post("/total-worked-time/:id", async (req, res) => {
  console.log("Request to get total worked time for a specific date");

  try {
    const userId = req.params.id;
    const { date } = req.body; // Expected format: "YYYY-MM-DD"
    console.log("date", date);

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Query for the user's logs on the specified date
    const timerLogs = await TimerLogModal.find({
      user: userId,
      date: date,
    });

    if (!timerLogs || timerLogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No logs found for the specified date" });
    }

    // Calculate total worked time for that date
    const totalWorkedTime = timerLogs.reduce((totalDuration, logEntry) => {
      const dailyDuration = logEntry.logs.reduce((acc, log) => {
        return acc.add(calculateTotalDuration(log.startTime, log.stopTime));
      }, moment.duration(0));

      return totalDuration.add(dailyDuration);
    }, moment.duration(0));

    // Format total worked time (hours:minutes:seconds)
    const formattedTotalWorkedTime = totalWorkedTime.format("H:mm:ss", {
      trim: false,
    });

    // Send the response
    res.status(200).json({ date, totalWorkedTime: formattedTotalWorkedTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// API to add timer logs for a specific date manually
// API to add timer logs for a specific date manually
router.post("/add-time/:userId", async (req, res) => {
  const { userId } = req.params;
  const { project, date, fromTime, toTime, reason } = req.body;
  console.log("Request to add time log", req.body);

  const source = "browser"; // Assuming source is always 'browser'
  const timeType = "manual"; // Assuming timeType is always 'manual'
  const activityRate = 50; // Set default activity rate to 50%

  try {
    // Convert date to 'YYYY-MM-DD' format
    const logDate = new Date(date).toISOString().split("T")[0];
    const fromTimeDate = new Date(`${logDate}T${fromTime}`);
    const toTimeDate = new Date(`${logDate}T${toTime}`);

    // Fetch logs for the user, date, timeType, and source from the database
    const existingLogs = await TimerLog.find({
      user: new mongoose.Types.ObjectId(userId),
      date: logDate,
      timeType: timeType, // Ensure logs with the same timeType
      source: source, // Ensure logs with the same source
    });

    // Check for overlapping logs
    for (const log of existingLogs) {
      for (const existingLog of log.logs) {
        const existingStartTime = new Date(
          `${log.date}T${existingLog.startTime}`
        );
        const existingStopTime = new Date(
          `${log.date}T${existingLog.stopTime}`
        );

        // Check if the new log overlaps with any existing logs
        const isOverlap =
          (fromTimeDate >= existingStartTime &&
            fromTimeDate < existingStopTime) ||
          (toTimeDate > existingStartTime && toTimeDate <= existingStopTime) ||
          (fromTimeDate <= existingStartTime && toTimeDate >= existingStopTime);

        if (isOverlap) {
          return res.status(400).json({
            message: "The log overlaps with an existing entry.",
          });
        }
      }
    }

    // No overlap found, create the new log
    const newLog = {
      startTime: fromTime,
      stopTime: toTime,
      reason: reason,
    };

    // Convert the project to an ObjectId before querying
    const projectId = new mongoose.Types.ObjectId(project);

    // Find if there's already a log for the same date, timeType, and source
    let timerLog = await TimerLog.findOne({
      user: new mongoose.Types.ObjectId(userId),
      date: logDate,
      project: projectId,
      timeType: timeType, // Check for the same timeType
      source: source, // Check for the same source
    });
    if (timerLog) {
      // Append the new log if same timeType and source exist
      timerLog.logs.push(newLog);
      await timerLog.save();
    } else {
      // Create a new log entry if none exists with the same timeType and source
      timerLog = new TimerLog({
        user: new mongoose.Types.ObjectId(userId),
        date: logDate,
        project: projectId, // Use the single project provided
        logs: [newLog],
        timeType: timeType, // Using provided timeType (manual, auto, etc.)
        source: source, // Using provided source (browser, mobile, etc.)
      });

      await timerLog.save();
    }

    // Now add activity for the added time entry
    const newActivity = new Activity({
      user: new mongoose.Types.ObjectId(userId),
      startTime: fromTime, // Use the 'fromTime' from the time log
      endTime: toTime, // Use the 'toTime' from the time log
      startDate: logDate, // Same log date
      endDate: logDate, // Same log date (assuming it's a single day entry)
      activityRate: activityRate, // Default activity rate of 50%
    });

    await newActivity.save(); // Save the activity

    return res.status(201).json({
      message: "New log and activity created successfully!",
      timerLog,
      newActivity, // Return the created activity
    });
  } catch (error) {
    console.error("Error adding log:", error);
    return res.status(500).json({
      message: "An error occurred while adding the log and activity.",
      error: error.message,
    });
  }
});

// Delete a specific log entry
router.delete("/:userId/:date", async (req, res) => {
  const { userId, date } = req.params;
  let { startTime, stopTime } = req.body;

  // Function to convert AM/PM to 24-hour format while keeping the seconds as they are
  const formatTimeTo24Hour = (time) => {
    const [timePart, period] = time.split(/ /); // Split into time part and period (AM/PM)
    const [hour, minute, second] = timePart.split(":");
    let h = parseInt(hour, 10);
    if (period.toLowerCase() === "pm" && h < 12) h += 12;
    if (period.toLowerCase() === "am" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}:${second}`; // Retain the seconds
  };

  // Convert incoming startTime and stopTime
  startTime = formatTimeTo24Hour(startTime);
  stopTime = formatTimeTo24Hour(stopTime);

  console.log(
    "Formatted req.body",
    { startTime, stopTime },
    "userId",
    userId,
    "date",
    date
  );

  try {
    const log = await TimerLog.findOne({ user: userId, date });
    console.log("log", log);
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    // Filter out the log entry matching the start and stop times
    log.logs = log.logs.filter(
      (entry) => entry.startTime !== startTime || entry.stopTime !== stopTime
    );

    console.log("Updated log.logs", log.logs);

    // Save the updated log
    await log.save();
    res.status(200).json({ message: "Log entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting log entry", details: err });
  }
});

// API to edit an existing timer log entry
router.put("/edit-time/:userId/:date", async (req, res) => {
  const { userId, date } = req.params;
  const { oldStartTime, oldStopTime, newStartTime, newStopTime } = req.body;

  try {
    // Convert date to 'YYYY-MM-DD' format
    const logDate = new Date(date).toISOString().split("T")[0];

    // Fetch the user's logs for the specified date
    const timerLog = await TimerLog.findOne({
      user: new mongoose.Types.ObjectId(userId),
      date: logDate,
    });

    if (!timerLog) {
      return res.status(404).json({ message: "Log not found" });
    }

    // Find the specific log entry to edit
    const logToEdit = timerLog.logs.find(
      (log) => log.startTime === oldStartTime && log.stopTime === oldStopTime
    );

    if (!logToEdit) {
      return res.status(404).json({ message: "Log entry not found" });
    }

    // Check if the new times overlap with any other existing logs
    for (const log of timerLog.logs) {
      if (log !== logToEdit) {
        const existingStartTime = new Date(`${logDate}T${log.startTime}`);
        const existingStopTime = new Date(`${logDate}T${log.stopTime}`);
        const newStartTimeDate = new Date(`${logDate}T${newStartTime}`);
        const newStopTimeDate = new Date(`${logDate}T${newStopTime}`);

        const isOverlap =
          (newStartTimeDate >= existingStartTime &&
            newStartTimeDate < existingStopTime) ||
          (newStopTimeDate > existingStartTime &&
            newStopTimeDate <= existingStopTime) ||
          (newStartTimeDate <= existingStartTime &&
            newStopTimeDate >= existingStopTime);

        if (isOverlap) {
          return res.status(400).json({
            message: "The new times overlap with an existing log.",
          });
        }
      }
    }

    // Update the log entry with new start and stop times
    logToEdit.startTime = newStartTime;
    logToEdit.stopTime = newStopTime;

    // Save the updated log
    await timerLog.save();

    return res.status(200).json({
      message: "Log entry updated successfully!",
      updatedLog: logToEdit,
    });
  } catch (error) {
    console.error("Error updating log:", error);
    return res.status(500).json({
      message: "An error occurred while updating the log.",
      error: error.message,
    });
  }
});

module.exports = router;
