import React, { useState } from "react";
import "./recentActivity.css";
import screenshot1 from "../Assets/screenshot1.png";
import userImage from "../Assets/userImage.png";
import expandMore from "../Assets/expand-more.png";
import { Link } from "react-router-dom";

const RecentActivity = () => {
  const [modalImage, setModalImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const RecentActivities = [
    {
      userImage: userImage,
      userName: "Mudassar Abbas",
      departmentName: "Computer Science",
      screenshots: [
        {
          image: screenshot1,
          percentage: "70",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "44",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "13",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
      ],
    },
    {
      userImage: userImage,
      userName: "Malik Huzaifa",
      departmentName: "Computer Science",
      screenshots: [
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
      ],
    },
    {
      userImage: userImage,
      userName: "Aleem Aslam",
      departmentName: "Psychology",
      screenshots: [
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
      ],
    },
    {
      userImage: userImage,
      userName: "Bilal Khan",
      departmentName: "BBA",
      screenshots: [
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
        {
          image: screenshot1,
          percentage: "000",
          time: "Day | DD,MM,YYYY | 00:00 AM",
        },
      ],
    },
  ];

  const openModal = (activityIndex, screenshotIndex) => {
    setModalImage(
      RecentActivities[activityIndex].screenshots[screenshotIndex].image
    );
    setCurrentImageIndex(screenshotIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const showNextImage = (activityIndex) => {
    const nextIndex =
      (currentImageIndex + 1) %
      RecentActivities[activityIndex].screenshots.length;
    setModalImage(RecentActivities[activityIndex].screenshots[nextIndex].image);
    setCurrentImageIndex(nextIndex);
  };

  const showPrevImage = (activityIndex) => {
    const prevIndex =
      (currentImageIndex -
        1 +
        RecentActivities[activityIndex].screenshots.length) %
      RecentActivities[activityIndex].screenshots.length;
    setModalImage(RecentActivities[activityIndex].screenshots[prevIndex].image);
    setCurrentImageIndex(prevIndex);
  };

  return (
    <div className="recent-activity">
      <div className="header">
        <h2>Recent Activity</h2>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <div className="recent-activity-view-all">
            <p>View all</p>
            <img src={expandMore} alt="expand more" />
          </div>
        </Link>
      </div>
      {RecentActivities.slice(0, 2).map((activity, activityIndex) => (
        <div key={activityIndex} className="activity-row">
          <hr className="hr" />
          <div className="activity-header">
            <img src={activity.userImage} alt="User" className="user-image" />
            <div className="user-details">
              <div className="user-name">{activity.userName}</div>
              <div className="department-name">{activity.departmentName}</div>
            </div>
          </div>
          <div className="activity-screenshots">
            {activity.screenshots
              .slice(0, 3)
              .map((screenshot, screenshotIndex) => (
                <div key={screenshotIndex} className="screenshot">
                  <img src={screenshot.image} alt="Screenshot" />
                  <div className="activity-info">
                    <span
                      className={`activity-percentage ${
                        screenshot.percentage > 50
                          ? "green"
                          : screenshot.percentage >= 20 &&
                            screenshot.percentage <= 50
                          ? "yellow"
                          : "red"
                      }`}
                    >
                      {screenshot.percentage}%
                    </span>
                    <span className="activity-time">{screenshot.time}</span>
                  </div>
                  <div
                    className="view-all-btn"
                    onClick={() => openModal(activityIndex, screenshotIndex)}
                  >
                    View All
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <div className="recent-modal">
          <div className="recent-modal-content">
            <span className="recent-close" onClick={closeModal}>
              &times;
            </span>
            <img
              src={modalImage}
              alt="Screenshot"
              className="recent-modal-image"
            />
            <div className="recent-modal-navigation">
              <button onClick={() => showPrevImage(0)}>Previous</button>
              <button onClick={() => showNextImage(0)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
