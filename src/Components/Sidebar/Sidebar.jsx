import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";
import plusCircle from "../../Components/Assets/plus-circle.png";
import logouticon from "../../Components/Assets/logout.png";
import logo from "../../Components/Assets/logo.png";
import logoSmall from "../../Components/Assets/logo-small.png";
import chevronDown from "../../Components/Assets/chevron-down.png";
import chevronUp from "../../Components/Assets/chevron-up.png";
import ActivityActive from "../../Components/Assets/Activity=Active.png";
import ActivityInactive from "../../Components/Assets/Activity=Inactive.png";
import CalendarActive from "../../Components/Assets/Calender=Active.png";
import CalendarInactive from "../../Components/Assets/Calender=Inactive.png";
import DashboardActive from "../../Components/Assets/Dashboard=Active.png";
import DashboardInactive from "../../Components/Assets/Dashboard=Inactive.png";
import SettingsActive from "../../Components/Assets/Settings=Active.png";
import SettingsInactive from "../../Components/Assets/Settings=Inactive.png";
import TimeActive from "../../Components/Assets/Time=Active.png";
import TimeInactive from "../../Components/Assets/Time=Inactive.png";
import UserActive from "../../Components/Assets/User=Active.png";
import UserInactive from "../../Components/Assets/User=Inactive.png";
import ProjectActive from "../../Components/Assets/Project=Active.png";
import ProjectInactive from "../../Components/Assets/Project=Inactive.png";
import chevronRight from "../../Components/Assets/chevron-right.png";
import chevronLeft from "../../Components/Assets/chevron-left.png";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const logoutUser = (e) => {
    if (!window.confirm("Are you sure you want to logout?")) {
      e.preventDefault();
    } else {
      dispatch(logout());
    }
  };

  const location = useLocation();
  const [dropdowns, setDropdowns] = useState({
    activity: false,
    calendar: false,
    reports: false,
    people: false,
    settings: false,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("");
  const [activeSubItem, setActiveSubItem] = useState("");
  const loginUser = useSelector((state) => state.auth);
  const id = loginUser.user._id;

  const toggleDropdown = (section) => {
    setDropdowns((prevDropdowns) => {
      const newDropdowns = {
        ...prevDropdowns,
        [section]: !prevDropdowns[section],
      };
      Object.keys(newDropdowns).forEach((key) => {
        if (key !== section) {
          newDropdowns[key] = false;
        }
      });
      return newDropdowns;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes("timesheet")) {
      setActiveItem("timesheets");
    } else if (currentPath.includes("activity")) {
      setActiveItem("activity");
      if (currentPath.includes("screenshots")) {
        setActiveSubItem("screenshots");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, activity: true }));
      } else if (currentPath.includes("apps")) {
        setActiveSubItem("apps");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, activity: true }));
      } else if (currentPath.includes("urls")) {
        setActiveSubItem("urls");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, activity: true }));
      }
    } else if (currentPath.includes("notifications")) {
      setActiveItem("notifications");
    } else if (currentPath.includes("projects")) {
      setActiveItem("projects");
    } else if (currentPath.includes("calendar")) {
      setActiveItem("calendar");
      if (currentPath.includes("schedules")) {
        setActiveSubItem("schedules");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, calendar: true }));
      } else if (currentPath.includes("time-off-requests")) {
        setActiveSubItem("time-off-requests");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, calendar: true }));
      }
    } else if (currentPath.includes("reports")) {
      setActiveItem("reports");
      if (currentPath.includes("daily-totals")) {
        setActiveSubItem("daily-totals");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, reports: true }));
      } else if (currentPath.includes("amounts-owned")) {
        setActiveSubItem("amounts-owned");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, reports: true }));
      } else if (currentPath.includes("payments")) {
        setActiveSubItem("payments");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, reports: true }));
      } else if (currentPath.includes("time-activity")) {
        setActiveSubItem("time-activity");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, reports: true }));
      } else if (currentPath.includes("all-reports")) {
        setActiveSubItem("all-reports");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, reports: true }));
      }
    } else if (currentPath.includes("people")) {
      setActiveItem("people");
      if (currentPath.includes("members")) {
        setActiveSubItem("members");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, people: true }));
      } else if (currentPath.includes("teams")) {
        setActiveSubItem("teams");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, people: true }));
      }
    } else if (currentPath.includes("settings")) {
      setActiveItem("settings");
      if (currentPath.includes("general")) {
        setActiveSubItem("general");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, settings: true }));
      } else if (currentPath.includes("feature")) {
        setActiveSubItem("feature");
        setDropdowns((prevDropdowns) => ({ ...prevDropdowns, settings: true }));
      }
    } else {
      setActiveItem("dashboard");
    }
  }, [location]);

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <div className="logo">
        <img
          src={isSidebarOpen ? logo : logoSmall}
          alt="Logo"
          className="sidebar-logo"
        />
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-main-ul">
          <li className="main-li">
            <Link to="/">
              <div
                className={`navbar-left-div ${
                  activeItem === "dashboard" ? "active" : ""
                }`}
                onClick={() => setActiveItem("dashboard")}
              >
                <img
                  src={
                    activeItem === "dashboard"
                      ? DashboardActive
                      : DashboardInactive
                  }
                  alt="icon"
                  className="navbar-first-icon"
                />
                {isSidebarOpen && "Dashboard"}
              </div>
            </Link>
          </li>
          <li className="main-li">
            <Link to="/timesheet">
              <div
                className={`navbar-left-div ${
                  activeItem === "timesheets" ? "active" : ""
                }`}
                onClick={() => setActiveItem("timesheets")}
              >
                <img
                  src={activeItem === "timesheets" ? TimeActive : TimeInactive}
                  alt="icon"
                  className="navbar-first-icon"
                />
                {isSidebarOpen && "Timesheets"}
              </div>
            </Link>
          </li>
          <li className="main-li">
            <Link to="/activity/screenshot">
              <div
                className={`navbar-left-div ${
                  activeItem === "activity" ? "active" : ""
                }`}
                onClick={() => setActiveItem("activity")}
              >
                <img
                  src={
                    activeItem === "activity"
                      ? ActivityActive
                      : ActivityInactive
                  }
                  alt="icon"
                  className="navbar-first-icon"
                />
                {isSidebarOpen && "Activity"}
              </div>
            </Link>
          </li>
          <li className="main-li">
            <Link to="/projects">
              <div
                className={`navbar-left-div ${
                  activeItem === "projects" ? "active" : ""
                }`}
                onClick={() => setActiveItem("projects")}
              >
                <img
                  src={
                    activeItem === "projects" ? ProjectActive : ProjectInactive
                  }
                  alt="icon"
                  className="navbar-first-icon"
                />
                {isSidebarOpen && "Projects"}
              </div>
            </Link>
          </li>
          <li className="main-li">
            <Link to="/calendar">
              <div
                className={`navbar-left-div ${
                  activeItem === "calendar" ? "active" : ""
                }`}
                onClick={() => setActiveItem("calendar")}
              >
                <img
                  src={
                    activeItem === "calendar"
                      ? CalendarActive
                      : CalendarInactive
                  }
                  alt="icon"
                  className="navbar-first-icon"
                />
                {isSidebarOpen && "Calendar "}
              </div>
            </Link>
          </li>

          <li className="drop-dowm-containing-div  main-li">
            <div
              className={`navbar-left-div ${
                activeItem === "people" ? "active" : ""
              }`}
              onClick={() => toggleDropdown("people")}
            >
              <img
                src={activeItem === "people" ? UserActive : UserInactive}
                alt="icon"
                className="navbar-first-icon"
              />
              {isSidebarOpen && "People"}
              {isSidebarOpen && (
                <img
                  src={dropdowns.people ? chevronUp : chevronDown}
                  alt="dropdown icon"
                  className="chevron-icon"
                />
              )}
            </div>
            {dropdowns.people && isSidebarOpen && (
              <ul className="dropdown-menu">
                <li className={activeSubItem === "members" ? "active" : ""}>
                  <Link
                    to="/people/members"
                    onClick={() => setActiveSubItem("members")}
                  >
                    <span>Members</span>
                  </Link>
                </li>
                <li className={activeSubItem === "teams" ? "active" : ""}>
                  <Link
                    to="/people/teams"
                    onClick={() => setActiveSubItem("teams")}
                  >
                    <span>Teams</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="main-li">
            <Link to={`/people/members/${id}`}>
              <div
                className={`navbar-left-div ${
                  activeItem === "settings" ? "active" : ""
                }`}
                onClick={() => setActiveItem("settings")}
              >
                <img
                  src={
                    activeItem === "settings"
                      ? SettingsActive
                      : SettingsInactive
                  }
                  alt="icon"
                  className="navbar-first-icon"
                />
                {isSidebarOpen && "Profile"}
              </div>
            </Link>
          </li>
          <li className="main-li">
            <Link to="/login" onClick={(e) => logoutUser(e)}>
              <div className="navbar-left-div">
                <img
                  src={logouticon}
                  alt="icon"
                  className="navbar-first-icon"
                />
                {isSidebarOpen && "Logout"}
              </div>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="toggle-button" onClick={toggleSidebar}>
        <img
          src={isSidebarOpen ? chevronLeft : chevronRight}
          alt="toggle sidebar"
          className="toggle-icon"
        />
      </div>
    </div>
  );
};

export default Sidebar;
