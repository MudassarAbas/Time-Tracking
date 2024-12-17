import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// Function to convert 12-hour format to 24-hour format
const convertTo24Hour = (timeString) => {
  const [time, modifier] = timeString.split(" ");
  let [hours, minutes, seconds] = time.split(":"); // Split into hours, minutes, and seconds

  if (modifier === "PM" && hours !== "12") {
    hours = parseInt(hours, 10) + 12;
  }
  if (modifier === "AM" && hours === "12") {
    hours = "00";
  }

  // If seconds are undefined, default to keeping minutes only (no ":00" appended)
  return seconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}:00`;
};

const EditTimeModal = ({ show, onClose, selectedLog, userId, date }) => {
  const [newStartTime, setNewStartTime] = useState("");
  const [newStopTime, setNewStopTime] = useState("");

  // Use effect to set initial values when selectedLog changes
  useEffect(() => {
    if (selectedLog) {
      // Convert to 24-hour format for the input
      const startTime24 = convertTo24Hour(selectedLog.start);
      const stopTime24 = convertTo24Hour(selectedLog.end);
      setNewStartTime(startTime24); // Set input value
      setNewStopTime(stopTime24); // Set input value
    }
  }, [selectedLog]);

  const submitEdit = async () => {
    // Old times will remain unchanged but converted to 24-hour format
    const oldStartTime = convertTo24Hour(selectedLog.start); // Convert to 24-hour format with seconds preserved
    const oldStopTime = convertTo24Hour(selectedLog.end); // Convert to 24-hour format with seconds preserved

    // Check if new times are filled
    if (newStartTime === "" || newStopTime === "") {
      toast.error("Please fill in both start and stop times.");
      return;
    }

    // If new times are in HH:mm format, append ":00" for seconds
    const convertedNewStartTime =
      newStartTime !== oldStartTime && newStartTime.length === 5
        ? convertTo24Hour(`${newStartTime}:00`)
        : convertTo24Hour(newStartTime);

    const convertedNewStopTime =
      newStopTime !== oldStopTime && newStopTime.length === 5
        ? convertTo24Hour(`${newStopTime}:00`)
        : convertTo24Hour(newStopTime);

    // Log to check values before sending
    console.log({
      oldStartTime,
      oldStopTime,
      newStartTime: convertedNewStartTime,
      newStopTime: convertedNewStopTime,
    });

    // Validate time order
    if (
      new Date(`${date}T${convertedNewStartTime}`) >=
      new Date(`${date}T${convertedNewStopTime}`)
    ) {
      toast.error("Start time must be earlier than stop time.");
      return;
    }

    // Check if the new values are different from the old ones
    if (
      convertedNewStartTime === oldStartTime &&
      convertedNewStopTime === oldStopTime
    ) {
      toast.error("No changes made to the time entry.");
      return; // Prevent the request if no changes
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/timesheet/edit-time/${userId}/${date}`,
        {
          oldStartTime,
          oldStopTime,
          newStartTime: convertedNewStartTime,
          newStopTime: convertedNewStopTime,
        }
      );

      toast.success(response.data.message);
      onClose(); // Close modal after submission
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message); // Show error from backend
      } else {
        toast.error("Error occurred. Please try again.");
      }
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Edit Time Entry</h2>

        <div className="modal-label">
          Old Start Time:
          <span className="old-time">{selectedLog?.start}</span>
        </div>

        <div className="modal-label">
          New Start Time <span className="red-star">*</span>
        </div>
        <input
          type="time"
          className="modal-input time-input"
          value={newStartTime} // Value will be in 24-hour format
          onChange={(e) => setNewStartTime(e.target.value)}
        />

        <div className="modal-label">
          Old Stop Time:
          <span className="old-time">{selectedLog?.end}</span>
        </div>

        <div className="modal-label">
          New Stop Time <span className="red-star">*</span>
        </div>
        <input
          type="time"
          className="modal-input time-input"
          value={newStopTime} // Value will be in 24-hour format
          onChange={(e) => setNewStopTime(e.target.value)}
        />

        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button send" onClick={submitEdit}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTimeModal;
