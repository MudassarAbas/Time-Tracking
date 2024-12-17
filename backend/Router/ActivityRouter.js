const router = require("express").Router();
const Activity = require("../Modals/activityTrackerModal");
const TimerLog = require("../Modals/userTimerLogModal");
const { check, validationResult } = require("express-validator");
const dotenv = require("dotenv");
dotenv.config();

///////////////////////////////////////////////////////////////////
//////////////////// POST /api/put/activity ///////////////////////
// Validation middleware
const validateActivityData = [
  check("user").notEmpty().withMessage("User ID is required."),
  check("startTime").notEmpty().withMessage("Start time is required."),
  check("endTime").notEmpty().withMessage("End time is required."),
  check("startDate").notEmpty().withMessage("Start date is required."),
  check("endDate").notEmpty().withMessage("End date is required."),
  check("activityRate")
    .isNumeric()
    .withMessage("Activity rate must be a number."),
];

router.post("/activity", validateActivityData, async (req, res) => {
  console.log("POST /api/put/activity");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user, startTime, endTime, activityRate, startDate, endDate } =
    req.body;

  try {
    const newActivity = new Activity({
      user,
      startTime,
      endTime,
      startDate,
      endDate,
      activityRate,
    });

    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    console.error("Error saving activity data:", error);
    res.status(500).send("Server Error");
  }
});

// Utility function to convert time strings to seconds
function timeStringToSeconds(timeString) {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

router.post("/timer-log", async (req, res) => {
  const { user, logData, project, source, timeType } = req.body;

  try {
    for (const logEntry of logData) {
      const { date, logs } = logEntry;

      // Step 1: Merge incoming logs to remove duplicates
      const mergedLogs = {};

      logs.forEach((log) => {
        const key = log.startTime;
        const logStopSeconds = timeStringToSeconds(log.stopTime);

        if (!mergedLogs[key]) {
          // Add new log with numeric stop time
          mergedLogs[key] = { ...log, stopSeconds: logStopSeconds };
        } else {
          // Update stopTime if this log has a later stopTime
          if (logStopSeconds > mergedLogs[key].stopSeconds) {
            mergedLogs[key].stopTime = log.stopTime;
            mergedLogs[key].stopSeconds = logStopSeconds;
          }
        }
      });

      // Convert merged logs back to an array
      const processedLogs = Object.values(mergedLogs);

      // Step 2: Find existing log entry in the database
      let timerLog = await TimerLog.findOne({ user, date, project });

      if (!timerLog) {
        // Create a new log entry if none exists
        timerLog = new TimerLog({
          user,
          date,
          project,
          source,
          timeType,
          logs: processedLogs.map(({ stopSeconds, ...rest }) => rest),
        });
      } else {
        // Map existing logs for quick access
        const existingLogsMap = {};
        timerLog.logs.forEach((log) => {
          existingLogsMap[log.startTime] = log;
        });

        // Step 3: Merge processed logs into existing logs
        processedLogs.forEach((newLog) => {
          const existingLog = existingLogsMap[newLog.startTime];
          const newStopSeconds = newLog.stopSeconds;

          if (existingLog) {
            const existingStopSeconds = timeStringToSeconds(
              existingLog.stopTime
            );
            // Update stopTime if the new stopTime is later
            if (newStopSeconds > existingStopSeconds) {
              existingLog.stopTime = newLog.stopTime;
            }
          } else {
            // Add new log if it doesn't overlap with existing ones
            const overlap = timerLog.logs.find((log) => {
              const logStartSeconds = timeStringToSeconds(log.startTime);
              const logStopSeconds = timeStringToSeconds(log.stopTime);
              const newStartSeconds = timeStringToSeconds(newLog.startTime);

              return (
                (newStartSeconds >= logStartSeconds &&
                  newStartSeconds <= logStopSeconds) ||
                (newStopSeconds >= logStartSeconds &&
                  newStopSeconds <= logStopSeconds)
              );
            });

            if (!overlap) {
              // Add new log entry
              timerLog.logs.push({
                startTime: newLog.startTime,
                stopTime: newLog.stopTime,
              });
            } else {
              // Merge overlapping logs
              const overlapStopSeconds = timeStringToSeconds(overlap.stopTime);
              if (newStopSeconds > overlapStopSeconds) {
                overlap.stopTime = newLog.stopTime;
              }
            }
          }
        });
      }

      // Save the updated or new timer log
      await timerLog.save();
    }

    res.status(200).json({ message: "Timer log data saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
// Compare this snippet from backend/Router/UserDataRouter.js:
