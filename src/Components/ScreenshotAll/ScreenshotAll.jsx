import React from "react";
import pencil from "../Assets/pencil.png"; // Assuming pencil icon is still required
import "./screenshotAll.css"; // Ensure to style this appropriately

const dummyData = [
  {
    timeRange: "9:00 am - 10:00 am",
    totalWorked: "0:35:49",
    department: "IT Department",
    screenshots: [
      { time: "9:26 am", image: "https://via.placeholder.com/600/1" },
      { time: "9:29 am", image: "https://via.placeholder.com/600/2" },
      { time: "9:31 am", image: "https://via.placeholder.com/600/3" },
      { time: "9:34 am", image: "https://via.placeholder.com/600/4" },
      { time: "9:37 am", image: "https://via.placeholder.com/600/5" },
      { time: "9:42 am", image: "https://via.placeholder.com/600/6" },
      { time: "9:44 am", image: "https://via.placeholder.com/600/7" },
      { time: "9:48 am", image: "https://via.placeholder.com/600/8" },
      { time: "9:52 am", image: "https://via.placeholder.com/600/9" },
      { time: "9:54 am", image: "https://via.placeholder.com/600/10" },
      { time: "9:59 am", image: "https://via.placeholder.com/600/11" },
    ],
  },
  {
    timeRange: "10:00 am - 11:00 am",
    totalWorked: "0:00:15",
    department: "IT Department",
    screenshots: [
      { time: "10:00 am", image: "https://via.placeholder.com/600/12" },
    ],
  },
];

function ScreenshotAll() {
  return (
    <div className="screenshot-all-container">
      {dummyData.map((hourData, index) => (
        <div className="screenshot-all-hour-block" key={index}>
          <div className="timeline">
            <div className="circle"></div>
          </div>
          <div>
            <div className="screenshot-all-hour-info">
              <div className="screenshot-all-time-label">
                {hourData.timeRange}
              </div>
              <div className="screenshot-all-total-time">
                Total time worked: <span>{hourData.totalWorked}</span>
              </div>
            </div>
            <div className="screenshot-all-grid">
              {hourData.screenshots.map((screenshot, screenshotIndex) => (
                <div className="screenshot-all-card" key={screenshotIndex}>
                  <div className="screenshot-all-department-label">
                    {hourData.department}
                  </div>
                  <div className="screenshot-all-no-todos">No to-dos</div>
                  <div className="screenshot-all-bottom">
                    <img
                      src={screenshot.image}
                      alt={`Screenshot taken at ${screenshot.time}`}
                      className="screenshot-all-thumbnail"
                    />
                    <div className="screenshot-all-time">{screenshot.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScreenshotAll;
