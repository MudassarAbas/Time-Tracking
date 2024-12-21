import React from "react";
import "./calendar.css";
import calender from "../../Components/Assets/calender.jpg";

function Calendar() {
  return (
    <div className="main-universal-div">
      <div className="main-universal-content">
        <img src={calender} alt="" className="year-calendar" />
      </div>
    </div>
  );
}

export default Calendar;
