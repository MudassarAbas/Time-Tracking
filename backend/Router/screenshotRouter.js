const router = require("express").Router();
const UserModal = require("../Modals/UserModal");
const Screenshot = require("../Modals/screenshotModal");
const Activity = require("../Modals/activityTrackerModal");
const moment = require("moment");
const dotenv = require("dotenv");
dotenv.config();

// Helper function to extract date and time from the S3 URL
function extractDateTimeFromUrl(s3Url) {
  const regex = /(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})_/; // Matches YYYY-MM-DD_HH-MM-SS
  const match = s3Url.match(regex);

  if (match) {
    const date = match[1]; // YYYY-MM-DD
    const hours = match[2]; // HH
    const minutes = match[3]; // MM
    const seconds = match[4]; // SS

    // Create a Date object in local time
    const dateTimeString = `${date}T${hours}:${minutes}:${seconds}`; // Format as YYYY-MM-DDTHH:MM:SS
    return new Date(dateTimeString + "Z"); // Add 'Z' to treat it as UTC time
  }

  return null; // Return null if no match is found
}

// POST API to upload screenshot metadata
router.post("/upload", async (req, res) => {
  const { userId, s3Url } = req.body;
  console.log("Received data:", req.body); // Log the incoming request

  try {
    // Ensure user exists
    const user = await UserModal.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract captureTime from the S3 URL
    console.log("s3URL: ", s3Url);
    const captureTime = extractDateTimeFromUrl(s3Url);
    console.log("Capture Time: ", captureTime);

    if (!captureTime) {
      return res.status(400).json({ error: "Invalid capture time extracted" });
    }

    // Create a new Screenshot entry
    const screenshot = new Screenshot({
      user: userId,
      s3Url,
      captureTime,
    });

    // Save the screenshot metadata to MongoDB
    await screenshot.save();

    // Respond to the client
    res
      .status(201)
      .json({ message: "Screenshot metadata saved successfully!" });
  } catch (err) {
    console.error("Error saving screenshot metadata:", err);
    res.status(500).json({ error: "Failed to save screenshot metadata" });
  }
});

// API to fetch screenshots and organize by intervals
router.get("/get-screenshots/:userId/:date", async (req, res) => {
  const { userId, date } = req.params; // Date format should be YYYY-MM-DD
  try {
    // Fetch screenshots for the user on the provided date
    const screenshots = await Screenshot.find({
      user: userId,
      s3Url: { $regex: `${date}` }, // Match only screenshots from this date
    });

    if (!screenshots.length) {
      return res
        .status(404)
        .json({ message: "No screenshots found for this date." });
    }

    // Organize screenshots into 10-minute intervals based on time in the URL
    const intervals = screenshots.map((screenshot) => {
      const captureTime = extractDateTimeFromUrl(screenshot.s3Url);
      const endTime = new Date(captureTime.getTime() + 10 * 60 * 1000); // Calculate end time 10 minutes after the capture time

      return {
        time: `${captureTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })} - ${endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`,
        department: screenshot.department || "No Department", // Adjust this as per your logic
        activity: 0, // Placeholder for activity, will be calculated later
        images: [screenshot.s3Url],
      };
    });

    // Group intervals into hourly blocks
    const hourlyBlocks = {};
    intervals.forEach((interval) => {
      const startTime = interval.time.split(" - ")[0]; // Get the start time of the interval
      const hour = startTime.split(":")[0]; // Extract the hour from the start time
      const hourKey = `${hour}:00 - ${parseInt(hour) + 1}:00`; // Define the hour block

      if (!hourlyBlocks[hourKey]) {
        hourlyBlocks[hourKey] = {
          timeRange: hourKey,
          totalWorked: "0:00:00", // Initialize total worked time
          intervals: [],
        };
      }

      // Increment totalWorked time by 10 minutes for each interval
      const [totalHours, totalMinutes, totalSeconds] = hourlyBlocks[
        hourKey
      ].totalWorked
        .split(":")
        .map(Number);
      const newTotalMinutes = totalMinutes + 10;
      const newTotalHours = totalHours + Math.floor(newTotalMinutes / 60);
      const adjustedMinutes = newTotalMinutes % 60;

      hourlyBlocks[hourKey].totalWorked = `${newTotalHours}:${String(
        adjustedMinutes
      ).padStart(2, "0")}:${String(totalSeconds).padStart(2, "0")}`;
      hourlyBlocks[hourKey].intervals.push(interval);
    });

    // Calculate activity rates based on user activity logs for the specified date
    const activityData = await Activity.find({
      user: userId,
      startDate: date,
      endDate: date,
    });

    // Calculate average activity rate for each interval
    intervals.forEach((interval) => {
      const [startHour, startMinute] = interval.time
        .split(" - ")[0]
        .split(":")
        .map(Number);
      const intervalStartTime = moment({
        hour: startHour,
        minute: startMinute,
      });
      const intervalEndTime = intervalStartTime.clone().add(10, "minutes");

      // Filter activities that fall within the interval
      const matchingActivities = activityData.filter((activity) => {
        const activityStart = moment(activity.startTime, "HH:mm:ss");
        const activityEnd = moment(activity.endTime, "HH:mm:ss");
        return (
          activityStart.isBefore(intervalEndTime) &&
          activityEnd.isAfter(intervalStartTime)
        );
      });

      // Calculate the average activity rate
      const totalActivityRate = matchingActivities.reduce(
        (sum, activity) => sum + activity.activityRate,
        0
      );
      const averageActivityRate =
        matchingActivities.length > 0
          ? (totalActivityRate / matchingActivities.length).toFixed(2)
          : 0;

      // Set the activity for the interval
      interval.activity = averageActivityRate;
    });

    // Convert hourlyBlocks object to an array
    const result = Object.values(hourlyBlocks);

    // Return the formatted response
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user activity and screenshots:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
