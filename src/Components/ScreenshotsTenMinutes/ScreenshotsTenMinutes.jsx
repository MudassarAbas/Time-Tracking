import React, { useState } from "react";
import pencil from "../Assets/pencil.png";
import "./screenshotsTenMinutes.css";
import ScreenshotViewer from "../ScreenshotViewer/ScreenshotViewer"; // Import the new component

const dummyData = [
  {
    timeRange: "6:00 pm - 7:00 pm",
    totalWorked: "1:00:00",
    intervals: [
      {
        time: "6:00 pm - 6:10 pm",
        department: "Graphic Design",
        activity: 32,
        images: [
          "https://via.placeholder.com/600/92c952",
          "https://via.placeholder.com/600/771796",
          "https://via.placeholder.com/600/24f355",
        ],
      },
      {
        time: "6:10 pm - 6:20 pm",
        department: "Graphic Design",
        activity: 69,
        images: ["https://via.placeholder.com/600/d32776"],
      },
      {
        time: "6:20 pm - 6:30 pm",
        department: "Graphic Design",
        activity: 35,
        images: ["https://via.placeholder.com/600/f66b97"],
      },
      {
        time: "6:30 pm - 6:40 pm",
        department: "No Department",
        activity: 0,
        images: [],
      },
      {
        time: "6:40 pm - 6:50 pm",
        department: "Graphic Design",
        activity: 70,
        images: [
          "https://via.placeholder.com/600/56a8c2",
          "https://via.placeholder.com/600/b0f7cc",
        ],
      },
      {
        time: "6:50 pm - 7:00 pm",
        department: "Graphic Design",
        activity: 74,
        images: ["https://via.placeholder.com/600/54176f"],
      },
    ],
  },
  {
    timeRange: "7:00 pm - 8:00 pm",
    totalWorked: "1:00:00",
    intervals: [
      {
        time: "7:00 pm - 7:10 pm",
        department: "Graphic Design",
        activity: 65,
        images: ["https://via.placeholder.com/600/51aa97"],
      },
      {
        time: "7:10 pm - 7:20 pm",
        department: "Graphic Design",
        activity: 75,
        images: ["https://via.placeholder.com/600/810b14"],
      },
      {
        time: "7:20 pm - 7:30 pm",
        department: "No Department",
        activity: 0,
        images: [],
      },
      {
        time: "7:30 pm - 7:40 pm",
        department: "Graphic Design",
        activity: 71,
        images: ["https://via.placeholder.com/600/1ee8a4"],
      },
      {
        time: "7:40 pm - 7:50 pm",
        department: "Graphic Design",
        activity: 74,
        images: ["https://via.placeholder.com/600/66b7d2"],
      },
      {
        time: "7:50 pm - 8:00 pm",
        department: "Graphic Design",
        activity: 80,
        images: ["https://via.placeholder.com/600/197d29"],
      },
    ],
  },
];

function ScreenshotsTenMinutes() {
  const [modalData, setModalData] = useState({
    isOpen: false,
    allScreenshots: [],
    initialIndex: 0,
  });

  const allScreenshots = dummyData.flatMap((hourData) =>
    hourData.intervals.flatMap((intervalData) => intervalData.images)
  );

  const openModal = (startIndex) => {
    setModalData({
      isOpen: true,
      allScreenshots,
      initialIndex: startIndex,
    });
  };

  const closeModal = () => {
    setModalData({ isOpen: false, allScreenshots: [], initialIndex: 0 });
  };

  return (
    <div className="screenshots-container">
      {dummyData.map((hourData, hourIndex) => (
        <div className="hour-block" key={hourIndex}>
          <div className="timeline">
            <div className="circle"></div>
          </div>
          <div className="hour-block-right-div">
            <div className="hour-info">
              <div className="time-label">{hourData.timeRange}</div>
              <div className="total-time">
                Total time worked: <span>{hourData.totalWorked}</span>
              </div>
            </div>
            <div className="screenshot-row">
              {hourData.intervals.map((intervalData, colIndex) => {
                const imageIndex = allScreenshots.indexOf(
                  intervalData.images[0]
                );

                // Check if there's any activity or not
                if (
                  intervalData.images.length === 0 &&
                  intervalData.activity === 0
                ) {
                  return (
                    <div className="no-activity-message" key={colIndex}>
                      <span>No Activity</span>
                    </div>
                  );
                }

                return (
                  <div className="screenshot-column" key={colIndex}>
                    <div className="department-label">
                      {intervalData.department}
                    </div>
                    <div className="no-todos">No to-dos</div>
                    <div className="screenshot-all-contnet">
                      {intervalData.images.length > 0 ? (
                        <div className="screenshot-card">
                          <img
                            src={intervalData.images[0]} // Show first image of the interval
                            alt={intervalData.department}
                            onClick={() => openModal(imageIndex)}
                            className="screenshot-thumbnail"
                          />
                          <div className="screens-label">
                            {intervalData.images.length} Screens
                          </div>
                        </div>
                      ) : (
                        <div className="no-activity">No activity</div>
                      )}
                      <div className="scrennshot-div">
                        <div className="screenshot-time">
                          {intervalData.time}
                        </div>
                        <img src={pencil} alt="" />
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: `${intervalData.activity}%` }}
                        ></div>
                      </div>
                      <div className="progress-percentage">
                        {intervalData.activity}% of 10 minutes
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {modalData.isOpen && (
        <ScreenshotViewer
          screenshots={modalData.allScreenshots}
          initialIndex={modalData.initialIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default ScreenshotsTenMinutes;
