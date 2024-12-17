import React from "react";
import "./projects.css";
import { Link } from "react-router-dom";
import expandMore from "../Assets/expand-more.png";

const Projects = () => {
  const projects = [
    {
      percentage: "20",
      departmentName: "Marketing Department",
      time: "000:00:00",
    },
    {
      percentage: "70",
      departmentName: "Marketing Department",
      time: "000:00:00",
    },
    {
      percentage: "20",
      departmentName: "Marketing Department",
      time: "000:00:00",
    },
    {
      percentage: "000",
      departmentName: "Sales Department",
      time: "000:00:00",
    },
    {
      percentage: "100",
      departmentName: "Sales Department",
      time: "000:00:00",
    },
    {
      percentage: "80",
      departmentName: "Sales Department",
      time: "000:00:00",
    },
    {
      percentage: "40",
      departmentName: "Sales Department",
      time: "000:00:00",
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
