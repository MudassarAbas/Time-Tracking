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
          "https://static.filehorse.com/screenshots/office-and-business-tools/desktime-screenshot-01.png",
          "https://via.placeholder.com/600/771796",
          "https://via.placeholder.com/600/24f355",
        ],
      },
      {
        time: "6:10 pm - 6:20 pm",
        department: "Graphic Design",
        activity: 69,
        images: ["https://static.filehorse.com/screenshots-mac/office-and-business-tools/desktime-screenshot-04.png"],
      },
      {
        time: "6:20 pm - 6:30 pm",
        department: "Graphic Design",
        activity: 35,
        images: ["https://www.jibble.io/wp-content/uploads/2022/12/desktime-4.png.webp"],
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
          "https://techcrunch.com/wp-content/uploads/2017/01/screen-shot-2017-01-17-at-4-12-55-pm.png",
          "https://via.placeholder.com/600/b0f7cc",
        ],
      },
      {
        time: "6:50 pm - 7:00 pm",
        department: "Graphic Design",
        activity: 74,
        images: ["https://www.datocms-assets.com/38028/1622837084-upkeep-screenshot.png"],
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
        images: ["https://imgix.tractian.com/website/pages/funcionalidades/tracos-ordens-de-servico/v2/en/header-image.png?auto=format&cs=origin&fit=max&q=100"],
      },
      {
        time: "7:10 pm - 7:20 pm",
        department: "Graphic Design",
        activity: 75,
        images: ["https://d33v4339jhl8k0.cloudfront.net/docs/assets/52fd7a8fe4b078f4bda9affa/images/5e6162e804286364bc9649e9/file-Tk3gXWbyZt.jpg"],
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
        images: ["https://d33v4339jhl8k0.cloudfront.net/docs/assets/52fd7a8fe4b078f4bda9affa/images/5c2cc73f04286304a71dcc78/file-3fdkLYQ5i2.png"],
      },
      {
        time: "7:40 pm - 7:50 pm",
        department: "Graphic Design",
        activity: 74,
        images: ["https://play-lh.googleusercontent.com/huYoiCrB1ynZkoBZ0jwYkj6fTEJ3v01lSHHPtzNciBuDbuL3vP7PtpDerG4bvPJ3Rw=w526-h296-rw"],
      },
      {
        time: "7:50 pm - 8:00 pm",
        department: "Graphic Design",
        activity: 80,
        images: ["https://i.pinimg.com/736x/a4/c5/d3/a4c5d352398abda70ab9df44a0d8c30f.jpg"],
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
