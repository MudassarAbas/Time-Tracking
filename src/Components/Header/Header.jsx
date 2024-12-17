import React from "react";
import "./header.css";

const Header = () => {
  const currentDate = new Date();
  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 6
  );
  const endDate = currentDate;

  return (
    <div className="header-main-div">
      <h1>Dashboard</h1>
      <div className="date-range">{`${startDate.toDateString()} - ${endDate.toDateString()}`}</div>
    </div>
  );
};

export default Header;
