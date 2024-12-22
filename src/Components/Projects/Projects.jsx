import React from "react";
import "./projects.css";
import { Link } from "react-router-dom";
import expandMore from "../Assets/expand-more.png";

const Projects = () => {
  const projects = [
    {
      percentage: "20",
      departmentName: "Marketing Department",
      time: "02:25:30",
    },
    {
      percentage: "70",
      departmentName: "Finance Department",
      time: "08:23:45",
    },
    {
      percentage: "20",
      departmentName: "IT Department",
      time: "02:25:00",
    },
    {
      percentage: "00",
      departmentName: "Sales Department",
      time: "00:00:00",
    },
    {
      percentage: "100",
      departmentName: "Media Department",
      time: "10:30:10",
    },
    {
      percentage: "80",
      departmentName: "Business Department",
      time: "09:30:10",
    },
    {
      percentage: "40",
      departmentName: "Security Department",
      time: "04:20:10",
    },
  ];
  function getInitials(name) {
    return name.split(" ")[0][0];
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2>Projects</h2>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <div className="projects-view-all">
            <p>View all</p>
            <img src={expandMore} alt="expand more" />
          </div>
        </Link>
      </div>
      <div className="projects-table">
        {projects.slice(0, 6).map((project, index) => (
          <div key={index} className="project-row">
            <div className="project-info">
              <span
                className={`project-activity-percentage ${
                  project.percentage > 50
                    ? "green"
                    : project.percentage >= 20 && project.percentage <= 50
                    ? "yellow"
                    : "red"
                }`}
              >
                {project.percentage}%
              </span>
              <div className="project-department-initials">
                {getInitials(project.departmentName)}
              </div>
              <div className="project-department-name">
                {project.departmentName}
              </div>
            </div>
            <div className="project-row-right">
              <div className="project-time">{project.time}</div>
              <div className="project-progress-bar">
                <div
                  className="project-progress"
                  style={{ width: `${project.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
