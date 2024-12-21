import React from "react";
import "./appsAndUrls.css";
import { Link } from "react-router-dom";
import expandMore from "../Assets/expand-more.png";

const AppsAndURLs = () => {
const urls = [
  {
    url: "www.workhub.com/hr",
    time: "00:12:34",
    progress: 80,
  },
  {
    url: "www.workhub.com/finance",
    time: "00:05:22",
    progress: 60,
  },
  {
    url: "www.workhub.com/marketing",
    time: "00:02:15",
    progress: 10,
  },
  {
    url: "www.workhub.com/engineering",
    time: "00:18:45",
    progress: 40,
  },
  {
    url: "www.workhub.com/sales",
    time: "00:09:30",
    progress: 60,
  },
];
  return (
    <div className="apps-urls-container">
      <div className="apps-urls-header">
        <h2>Apps and URLs</h2>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <div className="apps-urls-view-all">
            <p>View all</p>
            <img src={expandMore} alt="expand more" />
          </div>
        </Link>
      </div>
      <div className="apps-urls-table">
        {urls.slice(0, 6).map((url, index) => (
          <div key={index} className="apps-urls-row">
            <div className="apps-urls-info">
              <div className="apps-urls-url">{url.url}</div>
            </div>
            <div className="apps-urls-row-right">
              <div className="apps-urls-time">{url.time}</div>
              <div className="apps-urls-progress-bar">
                <div
                  className="apps-urls-progress"
                  style={{ width: `${url.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppsAndURLs;
