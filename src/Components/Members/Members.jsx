import React from "react";
import "./members.css";
import userImage from "../Assets/userImage.png";
import expandMore from "../Assets/expand-more.png";
import { Link } from "react-router-dom";

const MembersWidget = () => {
  const members = [
    {
      userImage: userImage,
      userName: "John Doe",
      departmentName: "Marketing",
      todayPercentage: "80",
      todayTime: "4h 30m",
      weekPercentage: "45",
      weekTime: "25h 15m",
    },
    {
      userImage: userImage,
      userName: "Jane Smith",
      departmentName: "Sales",
      todayPercentage: "15",
      todayTime: "3h 15m",
      weekPercentage: "60",
      weekTime: "20h 30m",
    },
    {
      userImage: userImage,
      userName: "Mike Johnson",
      departmentName: "Development",
      todayPercentage: "20",
      todayTime: "6h 45m",
      weekPercentage: "9",
      weekTime: "30h 10m",
    },
    {
      userImage: userImage,
      userName: "John Doe",
      departmentName: "Marketing",
      todayPercentage: "50",
      todayTime: "4h 30m",
      weekPercentage: "45",
      weekTime: "25h 15m",
    },
    {
      userImage: userImage,
      userName: "Jane Smith",
      departmentName: "Sales",
      todayPercentage: "15",
      todayTime: "3h 15m",
      weekPercentage: "60",
      weekTime: "20h 30m",
    },
    {
      userImage: userImage,
      userName: "Mike Johnson",
      departmentName: "Development",
      todayPercentage: "13",
      todayTime: "6h 45m",
      weekPercentage: "9",
      weekTime: "30h 10m",
    },
  ];

  return (
    <div className="members-container">
      <div className="members-header">
        <h2>Members</h2>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <div className="members-view-all">
            <p>View all</p>
            <img src={expandMore} alt="expand more" />
          </div>
        </Link>
      </div>
      <div className="members-table">
        <div className="members-table-header">
          <span>Member Info</span>
          <div>
            <span className="today-span">Today</span>
            <span className="this-week-span">This Week</span>
          </div>
        </div>
        {members.slice(0, 6).map((member, index) => (
          <div key={index} className="member-row">
            <div className="member-info">
              <img
                src={member.userImage}
                alt="User"
                className="member-user-image"
              />
              <div className="member-user-details">
                <div className="member-user-name">{member.userName}</div>
                <div className="member-department-name">
                  {member.departmentName}
                </div>
              </div>
            </div>
            <div className="members-stats-div">
              <div className="member-stats">
                <span
                  className={`member-activity-percentage ${
                    member.todayPercentage > 50
                      ? "green"
                      : member.todayPercentage >= 20 &&
                        member.todayPercentage <= 50
                      ? "yellow"
                      : "red"
                  }`}
                >
                  {member.todayPercentage}%
                </span>
                <span className="member-activity-time">{member.todayTime}</span>
              </div>
              <div className="member-stats this-week-member-stats">
                <span
                  className={`member-activity-percentage ${
                    member.weekPercentage > 50
                      ? "green"
                      : member.weekPercentage >= 20 &&
                        member.weekPercentage <= 50
                      ? "yellow"
                      : "red"
                  }`}
                >
                  {member.weekPercentage}%
                </span>
                <span className="member-activity-time">{member.weekTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersWidget;
