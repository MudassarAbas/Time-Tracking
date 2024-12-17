import React from "react";
import "./widget.css";
import ArrowDown from "../../Components/Assets/arrow_drop_down.png";
import ArrowUp from "../../Components/Assets/arrow_drop_up.png";
import HelpIcon from "../../Components/Assets/Help-icon.png";

const Widget = ({ title, value, change, positive }) => {
  return (
    <div className="widget">
      <div className="widget-title">
        {title}
        <img src={HelpIcon} alt="" />
      </div>
      <div className="widget-bottom-values">
        <div className="widget-value">{value}</div>
        <div className={`widget-change ${positive ? "positive" : "negative"}`}>
          {positive ? <img src={ArrowUp} /> : <img src={ArrowDown} />}
          {change}
        </div>
      </div>
    </div>
  );
};
export default Widget;
